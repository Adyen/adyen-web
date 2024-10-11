import { Locator, Page } from '@playwright/test';

export class PaymentPage {
    private readonly inputBox: Locator;
    private readonly todoItems: Locator;

    constructor(public readonly page: Page) {
        this.inputBox = this.page.locator('input.new-todo');
        this.todoItems = this.page.getByTestId('todo-item');
    }

    async goto() {
        await this.page.goto('https://demo.playwright.dev/todomvc/');
    }
}
