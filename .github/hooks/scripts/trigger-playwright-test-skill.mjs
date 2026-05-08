#!/usr/bin/env node

import process from 'node:process'

// Read the full hook payload from stdin.
function readStdin() {
  return new Promise((resolve) => {
    let data = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (chunk) => {
      data += chunk
    })
    process.stdin.on('end', () => resolve(data))
  })
}

// Safely resolve the first matching nested path from an object.
function getByPaths(obj, paths) {
  for (const path of paths) {
    let cursor = obj
    let found = true
    for (const key of path) {
      if (cursor && Object.prototype.hasOwnProperty.call(cursor, key)) {
        cursor = cursor[key]
      } else {
        found = false
        break
      }
    }
    if (found) {
      return cursor
    }
  }
  return undefined
}

// Extract tool name across possible hook payload shapes.
function extractToolName(payload) {
  return getByPaths(payload, [
    ['toolName'],
    ['tool_name'],
    ['tool', 'name'],
    ['hookSpecificInput', 'toolName'],
    ['hookSpecificInput', 'tool_name'],
  ])
}

// Extract tool input across possible hook payload shapes.
function extractToolInput(payload) {
  const rawInput =
    getByPaths(payload, [
      ['toolInput'],
      ['tool_input'],
      ['toolArgs'],
      ['tool_args'],
      ['tool', 'input'],
      ['hookSpecificInput', 'toolInput'],
      ['hookSpecificInput', 'tool_input'],
      ['hookSpecificInput', 'toolArgs'],
      ['hookSpecificInput', 'tool_args'],
    ]) || {}

  if (typeof rawInput === 'string') {
    try {
      const parsed = JSON.parse(rawInput)
      return parsed && typeof parsed === 'object' ? parsed : {}
    } catch {
      return { raw: rawInput }
    }
  }

  return rawInput && typeof rawInput === 'object' ? rawInput : {}
}

// Extract tool output/result across possible hook payload shapes.
function extractToolOutput(payload) {
  return (
    getByPaths(payload, [
      ['toolOutput'],
      ['tool_output'],
      ['toolResult'],
      ['tool_result'],
      ['tool', 'output'],
      ['tool', 'result'],
      ['hookSpecificInput', 'toolOutput'],
      ['hookSpecificInput', 'tool_output'],
      ['hookSpecificInput', 'toolResult'],
      ['hookSpecificInput', 'tool_result'],
    ]) || {}
  )
}

// Extract hook event name across possible hook payload shapes.
function extractEventName(payload) {
  return getByPaths(payload, [
    ['eventName'],
    ['event_name'],
    ['hookEventName'],
    ['hook_event_name'],
    ['hookEvent', 'name'],
    ['hookSpecificInput', 'hookEventName'],
    ['hookSpecificInput', 'hook_event_name'],
  ])
}

// Normalize any value into a searchable string.
function valueAsString(value) {
  if (typeof value === 'string') {
    return value
  }
  try {
    return JSON.stringify(value)
  } catch {
    return ''
  }
}

// Detect likely test failure using exit code first, then text heuristics.
function detectFailure(output) {
  const exitCode = Number(
    getByPaths(output, [
      ['exitCode'],
      ['exit_code'],
      ['status'],
      ['summary', 'exitCode'],
      ['summary', 'exit_code'],
    ]),
  )

  if (Number.isFinite(exitCode) && exitCode > 0) {
    return true
  }

  const text = valueAsString(output).toLowerCase()

  if (/\b0\s+failed\b/.test(text)) {
    return false
  }

  return (
    /(^|\W)failed(\W|$)/.test(text) ||
    /(^|\W)error(\W|$)/.test(text) ||
    /✖/.test(text) ||
    /\bproblems?\b/.test(text)
  )
}

// Only react to test-related commands/tools.
function isTestCommand(toolName, toolInput) {
  if (toolName === 'runTests') {
    return true
  }

  if (
    toolName !== 'run_in_terminal' &&
    toolName !== 'bash' &&
    toolName !== 'shell' &&
    toolName !== 'powershell'
  ) {
    return false
  }

  const command = String(
    getByPaths(toolInput, [['command'], ['args', 'command']]) || '',
  ).toLowerCase()

  return (
    command.includes('npm test') ||
    command.includes('pnpm test') ||
    command.includes('yarn test') ||
    command.includes('npx playwright test') ||
    command.includes('playwright test') ||
    command.includes('npm run pretest')
  )
}

// Emit hook response and optional system message for the agent.
function emitContinue(systemMessage) {
  const output = { continue: true }
  if (systemMessage) {
    output.systemMessage = systemMessage
  }
  process.stdout.write(JSON.stringify(output))
}

// Main hook handler: for failure events, detect failed test runs and inject guidance.
async function main() {
  const raw = await readStdin()
  if (!raw.trim()) {
    emitContinue()
    return
  }

  let payload
  try {
    payload = JSON.parse(raw)
  } catch {
    emitContinue()
    return
  }

  const eventName = extractEventName(payload)
  const normalizedEvent = String(eventName || '').toLowerCase()
  const toolName = extractToolName(payload)
  const toolInput = extractToolInput(payload)
  const toolOutput = extractToolOutput(payload)

  if (normalizedEvent && normalizedEvent !== 'posttoolusefailure') {
    emitContinue()
    return
  }

  if (!isTestCommand(toolName, toolInput)) {
    emitContinue()
    return
  }

  if (!detectFailure(toolOutput)) {
    emitContinue()
    return
  }

  emitContinue(
    'Detected a failed test run. Invoke the playwright-fix-failures skill and follow it strictly: fix failures one-by-one by addressing root causes, do not weaken assertions, and remove temporary debugging artifacts after tests pass.',
  )
}

// Fail open: never block agent flow if the hook script errors.
main().catch(() => {
  emitContinue()
})
