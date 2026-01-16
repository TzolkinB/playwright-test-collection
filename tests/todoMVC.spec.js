import { test, expect } from '@playwright/test';
import { verifyLink } from './helpers'; 

test.describe('TODO MVC Demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/#/');
    await expect(page).toHaveURL(/todomvc/);
  });

  test('Should have a header and footer', async ({ page }) => {
    const footer = page.locator('footer')
    const createdByLink = footer.getByRole('link', { name: 'Remo H. Jansen'})
    const todoLink = footer.getByRole('link', { name: 'TodoMVC'})
    const createdByHref = 'http://github.com/remojansen/'
    const todoHref = 'http://todomvc.com'
    const footerContents = [
      'Double-click to edit a todo',
      'Created by',
      'Part of TodoMVC'
    ];
    await expect(page.getByRole('heading', { level: 1, name: 'todos' })).toBeVisible()

    for (const expectedText of footerContents) {
      await expect(footer.getByText(expectedText, { exact: false })).toBeVisible();
    }

    await expect(createdByLink).toHaveAttribute('href', createdByHref)
    await expect(todoLink).toHaveAttribute('href', todoHref)
  });

  test('Input box and ToDo List UI', async ({ page }) => {
    const todoApp = page.locator('section.todoapp')
    const todoInputBox =  todoApp.getByRole('textbox', { name: 'What needs to be done?' })
    const inputsAllowed = [
      'Something really long that will have to wrap WWWWWWWWWWWWWWWWWWWWWWWWW',
      '!@#$%^&*()?\'~',
      '$123.98'
    ]
    await expect(todoInputBox).toBeEmpty()
    // Todo list and footer list are not visible if no todos
    await expect(todoApp.getByRole('list')).toHaveCount(0)

    await todoInputBox.click();
    await todoInputBox.fill('Write a test for the input box');
    await todoInputBox.press('Enter');


    // Once a todo is added, a section appears with the todos and list footer
    const todoList = todoApp.locator('section.main')
    await expect(todoList.getByTestId('todo-item')).toHaveCount(1)
    await expect(todoList.getByText('Write a test for the input box')).toBeVisible();
    await todoList.getByRole('listitem').filter({ hasText: 'Write a test for the input box' }).getByLabel('Toggle Todo').check();
    await todoList.getByRole('listitem').filter({ hasText: 'Write a test for the input box' }).getByLabel('Toggle Todo').uncheck();

    // Todo footer
    const todoFooter = todoApp.locator('footer.footer')
    const todoLinks = todoFooter.getByRole('link')
    const linkContents = [
      {text: 'All', href: '#/'},
      {text: 'Active', href: '#/active'},
      {text: 'Completed', href: '#/completed'}
    ]
    await expect(todoFooter.getByTestId('todo-count')).toContainText('1 item left')
    await expect(todoLinks).toHaveCount(3)
    for (const link of linkContents) {
      await verifyLink(todoLinks, link.text, link.href);
    }

    // Test input edge cases
    for (const text of inputsAllowed) {
      await todoInputBox.click();
      await todoInputBox.fill(text);
      await todoInputBox.press('Enter');
    }
    await expect(todoList.getByTestId('todo-item')).toHaveCount(4)

    // Delect "X" does not appear by list item unless hovered & clinked?
    await todoList.getByRole('button', { name: 'Delete' }).isHidden()
    await todoList.getByText('Write a test for the input box').click()
    await todoList.getByRole('button', { name: 'Delete' }).toBeVisible()
    
    // TODO: toggling footer 3 views, deleting, checking todo
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('Mark all as complete')).toBeVisible();
    await page.getByText('Mark all as complete').click();
    await page.getByText('Mark all as complete').click();
    await page.getByRole('checkbox', { name: 'Toggle Todo' }).nth(1).check();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('listitem').filter({ hasText: 'How long of a todo item is' }).getByLabel('Toggle Todo').check();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Clear completed' }).click();
    await todoInputBox.click();
    await todoInputBox.fill('I forgot to test the bottom buttons');
    await todoInputBox.press('Enter');
    await todoInputBox.fill('try again');
    await todoInputBox.press('Enter');
    await todoInputBox.fill('one more');
    await todoInputBox.press('Enter');
    await page.getByRole('link', { name: 'All' }).click();
    await page.getByRole('link', { name: 'Active' }).click();
    await page.getByRole('listitem').filter({ hasText: 'try again' }).getByLabel('Toggle Todo').check();
    await page.goto('https://demo.playwright.dev/todomvc/#/');
    await page.getByRole('link', { name: 'Completed' }).click();
  })
});