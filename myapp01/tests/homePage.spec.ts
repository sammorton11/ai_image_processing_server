import { test, expect } from '@playwright/test';
import path from "path";

const testImageUrl = 'https://imgs.search.brave.com/P4xkGJ-N800TxNhQ3UAE_s16BOdmJFJiRa3N6uPLGZY/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9oYW5k/eW1hbmRnLndwZW5n/aW5lcG93ZXJlZC5j/b20vd3AtY29udGVu/dC91cGxvYWRzL29s/ZF9pbWFnZXMvZy1w/ZXN0c2FuZGRpc2Vh/c2VzLW51dHJpZW50/ZGVmaWNpZW5jaWVz/LVBIT1NQSE9SVVNf/MC5qcGc'
const urlPlaceholder = 'https://vsesorta.ru/upload/iblock/bdc/737923i-khosta-gibridnaya-hands-up.jpg';
const errorText = 'Something went wrong - Please try again';
const __dirname = path.resolve();
const PORT: string = '5173';


test.beforeEach(async ({ page }) => {
   await page.goto(`http://localhost:${PORT}`);
});


// Type in the URL and click submit
// Check if the image is displayed
test.describe('Plant Identification Page', () => {
   test('process url test', async ({ request, page }) => {
      await page.locator(`input[placeholder="${urlPlaceholder}"]`).fill(testImageUrl);
      await page.locator('button:has-text("Submit URL")').click();
      await page.waitForLoadState('networkidle');

      const isImageDisplayed = await page.locator(`img[src="${testImageUrl}"]`).isVisible();
      expect(isImageDisplayed).toBeTruthy();

      const typedImageUrl = await page.locator(`input[placeholder="${urlPlaceholder}"]`).inputValue();

      const response = await request.post("http://127.0.0.1:5001/process_image_url", {
         data: {
            image_url: typedImageUrl,
         }
      });

      const responseBody = await response.json();
      console.log(responseBody);
      expect(response.status()).toBe(200);

      // It's difficult to test what exactly the AI will respond with - checking that the plant type is a string
      // is good enough for now.
      expect(typeof responseBody.type).toBe('string');
      expect(responseBody.type).toBeTruthy();
   });

   test('loads all init elements visible', async ({ page }) => {
      await expect(page.getByText('Plant Deficiency Detection AI')).toBeVisible();
      await expect(page.getByText('Using Gemini API by Google')).toBeVisible();
      await expect(page.getByText('Image URL:')).toBeVisible();
      await expect(page.getByText('Submit URL')).toBeVisible();
      await expect(page.getByText('Submit File')).toBeVisible();
      await expect(page.getByText('Clear')).toBeVisible();
   });


   // Test sometimes fails on FireFox - #upload id not found on Firefox?
   test('image file upload test', async ({ page }) => {
      await page.locator('#upload').nth(0).setInputFiles(path.join(__dirname, 'test-image01.jpeg'));
      await page.locator('button:has-text("Submit File")').click();
      await page.waitForLoadState('networkidle');

      const isImageDisplayed = await page.locator(`img[src="${testImageUrl}"]`).isVisible()
      expect(isImageDisplayed).toBeTruthy();
   });
});

// Test fails on FireFox
test('upload incorrect file type', async ({ page }) => {
   await page.setInputFiles('input[type=file]', path.join(__dirname, 'bad-img.jleg'));
   await page.click('text=Submit File');
   await page.waitForLoadState('networkidle');

   const isImageDisplayed = await page.locator(`img[src="${testImageUrl}"]`).isVisible();
   const imgIssue = await page.getByAltText('issue').nth(0).isVisible();
   const response = await page.locator(`text=${errorText}`).isVisible();

   expect(response).toBeTruthy();
   expect(imgIssue).toBeTruthy(); // This shouldn't even be there - frontend should just hide this and an error should be shown instead :)
   expect(isImageDisplayed).toBeFalsy();
});

// Test dark/light theme button toggle
test('theme toggle functionality', async ({ page }) => {
   const themeToggleButtonClosed = page.locator('button[aria-haspopup="menu"][data-state="closed"]');
   await themeToggleButtonClosed.click();

   const themeToggleButtonOpen = await page.locator('button[aria-haspopup="menu"][data-state="open"]').isVisible();
   expect(themeToggleButtonOpen).toBeTruthy()

   const lightOption = await page.locator('role=menuitem[name="Light"]').isVisible();
   const darkOption = await page.locator('role=menuitem[name="Dark"]').isVisible();
   const systemOption = await page.locator('role=menuitem[name="System"]').isVisible();

   expect(lightOption).toBeTruthy()
   expect(darkOption).toBeTruthy()
   expect(systemOption).toBeTruthy()
});

// Test Clear button removes the IssueList
test('clear button functionality', async ({ page }) => {
   const issueList = page.locator('.issue-list');
   await page.locator('button:has-text("Clear")').click();
   expect(await issueList.count()).toBe(0);
});

// Test Bar, Radar, Polar Area, Line, and Doughnut graph buttons are visible
test('chart buttons visibility', async ({ page }) => {
   const chartButtons = ['Bar', 'Radar', 'Polar Area', 'Line', 'Doughnut'];
   for (const button of chartButtons) {
      await expect(page.locator(`button:has-text("${button}")`)).toBeVisible();
   }
});

// Test graph buttons show the correct graph when clicked
test('graph buttons functionality', async ({ page }) => {
   const graphButtons = ['Bar', 'Radar', 'Polar Area', 'Line', 'Doughnut'];
   for (const button of graphButtons) {
      await page.locator(`button:has-text("${button}")`).click();


      const displayedGraphType = await page.locator('.graph-type').textContent();
      expect(displayedGraphType).toBe(button);
   }
});

// Test that image is zoomed in when clicked
test('image zoom functionality', async ({ page }) => {
   const image = page.locator('img');
   await image.click();

   const isZoomedIn = await page.locator('.zoomed-in').isVisible();
   expect(isZoomedIn).toBeTruthy();
});
