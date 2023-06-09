import { expect, test } from '@playwright/test';

import { MOCK_USERS } from './lib/fixtures.js';
import {
	createAndLoginUser,
	createUser,
	expectToBeInHomepage,
	logoutCurrentUser,
	matchSnapshot,
	resetDatabase,
	setSnapshotPath,
	verifyUser
} from './lib/helpers.js';

test.describe('Users', () => {
	test.beforeEach(async ({ page }, testInfo) => {
		setSnapshotPath(testInfo);
		await resetDatabase();
		await page.goto('/');
	});

	test("Can't join, user already exists", async ({ page }) => {
		await createUser(MOCK_USERS.alice);
		await verifyUser(MOCK_USERS.alice.email);

		await page.click('button[aria-label="Toggle navigation"]');
		await page.getByText('Join to play').first().click();
		await expect(page.locator('h1', { hasText: 'Join to play' })).toBeVisible();

		const submitButton = page.locator('button[type=submit]', { hasText: 'Join' });
		await expect(submitButton).toBeDisabled();

		await page.getByLabel('E-mail').fill(MOCK_USERS.alice.email);
		await page.getByLabel('Nickname').fill(MOCK_USERS.alice.nickname);
		await page.getByLabel('Password', { exact: true }).fill(MOCK_USERS.alice.password);
		await page.getByLabel('Confirm password').fill(MOCK_USERS.alice.password);
		await page.getByLabel('I agree to the terms of service and privacy policy').check();
		await expect(submitButton).not.toBeDisabled();
		await expect(page.getByText('Email is already in use or is invalid')).not.toBeVisible();

		await submitButton.click();
		await expect(page.getByText('Almost there...')).not.toBeVisible();
		await expect(page.getByText('Email is already in use or is invalid')).toBeVisible();
		await expect(page.getByText('Nickname is already taken or is invalid')).not.toBeVisible();
		await page.getByLabel('E-mail').fill('not-alice@example.com');

		await page.getByLabel('Nickname').fill(MOCK_USERS.alice.nickname);
		await page.getByLabel('Password', { exact: true }).fill(MOCK_USERS.alice.password);
		await page.getByLabel('Confirm password').fill(MOCK_USERS.alice.password);
		await page.getByLabel('I agree to the terms of service and privacy policy').check();
		await expect(submitButton).not.toBeDisabled();

		await submitButton.click();
		await expect(page.getByText('Nickname is already taken or is invalid')).toBeVisible();
		await expect(page.getByText('Email is already in use or is invalid')).not.toBeVisible();
		await matchSnapshot(page, 'auth-signup-with-errors');
	});

	test('Can join', async ({ page }) => {
		await page.click('button[aria-label="Toggle navigation"]');
		await page.getByText('Join to play').first().click();
		await expect(page.locator('h1', { hasText: 'Join to play' })).toBeVisible();
		await expect(page.getByText('Already have an account? Login')).toBeVisible();

		const submitButton = page.locator('button[type=submit]', { hasText: 'Join' });
		await expect(submitButton).toBeDisabled();

		await page.getByLabel('E-mail').fill(MOCK_USERS.alice.email);
		await page.getByLabel('Nickname').fill(MOCK_USERS.alice.nickname);
		await page.getByLabel('Password', { exact: true }).fill(MOCK_USERS.alice.password);
		await page.getByLabel('Confirm password').fill(MOCK_USERS.alice.password);
		await page.getByLabel('I agree to the terms of service and privacy policy').check();
		await expect(submitButton).not.toBeDisabled();

		await submitButton.click();
		await expect(page.getByText('Almost there...')).toBeVisible();
		await expect(page.getByText('Check your email to verify your account')).toBeVisible();
		await matchSnapshot(page, 'auth-signup-verification');
	});

	test('Can login and logout', async ({ page }) => {
		await createUser(MOCK_USERS.alice);

		// Check logged out navigation
		await page.click('button[aria-label="Toggle navigation"]');
		await expect(page.getByText('Join to play').first()).toBeVisible();
		await expect(page.getByText('Login').first()).toBeVisible();
		await expect(page.getByText('Alice')).not.toBeVisible();
		await expect(page.getByText('Drafts')).not.toBeVisible();
		await expect(page.getByText('Logout')).not.toBeVisible();

		await page.getByText('Login').first().click();
		await expect(page.locator('h1', { hasText: 'Login' })).toBeVisible();
		await expect(page.getByText("Don't have an account? Join to play")).toBeVisible();

		const submitButton = page.locator('button[type=submit]', { hasText: 'Login' });
		await expect(submitButton).toBeDisabled();

		await page.getByLabel('E-mail').fill(MOCK_USERS.alice.email);
		await page.getByLabel('Password').fill(MOCK_USERS.alice.password);
		await expect(submitButton).not.toBeDisabled();

		await submitButton.click();
		await expect(page.getByText("Can't login, check your credentials")).toBeVisible();
		await matchSnapshot(page, 'auth-login-with-errors');

		await verifyUser(MOCK_USERS.alice.email);

		await page.getByLabel('Password').fill(MOCK_USERS.alice.password);
		await submitButton.click();
		await expect(page.getByText("Can't login, check your credentials")).not.toBeVisible();

		await page.click('button[aria-label="Toggle navigation"]');
		await expect(page.locator('a.category', { hasText: 'Politics' })).toBeVisible();
		await expectToBeInHomepage(page);

		// Check logged in navigation
		await page.click('button[aria-label="Toggle navigation"]');
		await expect(page.getByText('Alice')).toBeVisible();
		await expect(page.getByText('Drafts').first()).toBeVisible();
		await expect(page.getByText('Logout')).toBeVisible();
		await expect(page.getByText('Join to play')).not.toBeVisible();
		await expect(page.getByText('Login')).not.toBeVisible();

		// Logout
		await page.click('button[aria-label="Toggle navigation"]');
		await page.getByText('Logout').click();

		// Check logged out navigation
		await page.click('button[aria-label="Toggle navigation"]');
		await expect(page.getByText('Login').first()).toBeVisible();
		await expect(page.getByText('Alice')).not.toBeVisible();
		await matchSnapshot(page, 'homepage-with-logged-out-user');
	});

	test('Can reset forgotten password', async ({ page }) => {
		const loginButton = page.locator('button[type=submit]', { hasText: 'Login' });
		const passwordResetButton = page.locator('button[type=submit]', {
			hasText: 'Send password reset email'
		});

		await page.goto('/login');
		await expect(loginButton).toBeVisible();
		await expect(passwordResetButton).not.toBeVisible();

		await page.getByText('Forgot your password?').click();
		await expect(
			page.getByText('Email has been sent. Reset the password and login here')
		).not.toBeVisible();
		await expect(loginButton).not.toBeVisible();
		await expect(passwordResetButton).toBeVisible();
		await expect(passwordResetButton).toBeDisabled();
		await expect(page.getByLabel('E-mail')).not.toBeDisabled();

		await page.getByLabel('E-mail').fill('mocked@example.com');
		await expect(passwordResetButton).not.toBeDisabled();
		await matchSnapshot(page, 'auth-forgot-password');

		await passwordResetButton.click();
		await expect(
			page.getByText('Email has been sent. Reset the password and login here')
		).toBeVisible();
		await expect(passwordResetButton).toBeDisabled();
		await expect(page.getByLabel('E-mail')).toBeDisabled();
		await matchSnapshot(page, 'auth-confirm-email');

		await page.getByText('login here').click();
		await expect(loginButton).toBeVisible();
		await expect(passwordResetButton).not.toBeVisible();
	});

	test('Redirect away from guest-only paths when user is logged in', async ({ page }) => {
		await createAndLoginUser(MOCK_USERS.alice, page);

		await page.goto('/login');
		await expect(page.locator('button[type=submit]', { hasText: 'Login' })).not.toBeVisible();
		await expectToBeInHomepage(page);

		await page.goto('/login/forgot-password');
		await expect(
			page.locator('button[type=submit]', { hasText: 'Send password reset email' })
		).not.toBeVisible();
		await expectToBeInHomepage(page);

		await page.goto('/join');
		await expect(page.locator('button[type=submit]', { hasText: 'Join' })).not.toBeVisible();
		await expectToBeInHomepage(page);

		await logoutCurrentUser(page);

		await page.goto('/login');
		await expect(page.locator('button[type=submit]', { hasText: 'Login' })).toBeVisible();
		await expect(page.getByText('Generated by AI, curated by humans')).not.toBeVisible();

		await page.goto('/login/forgot-password');
		await expect(
			page.locator('button[type=submit]', { hasText: 'Send password reset email' })
		).toBeVisible();
		await expect(page.getByText('Generated by AI, curated by humans')).not.toBeVisible();

		await page.goto('/join');
		await expect(page.locator('button[type=submit]', { hasText: 'Join' })).toBeVisible();
		await expect(page.getByText('Generated by AI, curated by humans')).not.toBeVisible();
	});
});
