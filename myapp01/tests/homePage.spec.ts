import { test, expect } from '@playwright/test';
import path from 'path';

const testImage = 'https://imgs.search.brave.com/P4xkGJ-N800TxNhQ3UAE_s16BOdmJFJiRa3N6uPLGZY/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9oYW5k/eW1hbmRnLndwZW5n/aW5lcG93ZXJlZC5j/b20vd3AtY29udGVu/dC91cGxvYWRzL29s/ZF9pbWFnZXMvZy1w/ZXN0c2FuZGRpc2Vh/c2VzLW51dHJpZW50/ZGVmaWNpZW5jaWVz/LVBIT1NQSE9SVVNf/MC5qcGc'
const urlPlaceholder = 'https://vsesorta.ru/upload/iblock/bdc/737923i-khosta-gibridnaya-hands-up.jpg';
const errorText = 'Something went wrong - Please try again';
const __dirname = path.resolve();

test.beforeEach(async ({ page }) => {
   await page.goto('http://localhost:5173')
});

// Type in the URL and click submit
// Check if the image is displayed
// Confirm response body type is "Cabbage Plant"
test.describe('Plant Identification Page', () => {
   test('process url test', async ({ request, page }) => {
      await page.locator(`input[placeholder="${urlPlaceholder}"]`).fill(testImage);
      await page.locator('button:has-text("Submit URL")').click();
      await page.waitForLoadState('networkidle');

      const isImageDisplayed = await page.locator(`img[src="${testImage}"]`).isVisible();
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
      expect(responseBody.type).toBe("Cabbage Plant");
   });

   test('loads all init elements visible', async ({ page }) => {
      await expect(page.getByText('Plant Deficiency Detection AI')).toBeVisible();
      await expect(page.getByText('Using Gemini API by Google')).toBeVisible();
      await expect(page.getByText('Image URL:')).toBeVisible();
      await expect(page.getByText('Submit URL')).toBeVisible();
      await expect(page.getByText('Submit File')).toBeVisible();
      await expect(page.getByText('Clear')).toBeVisible();
      await expect(page.getByText('Graph')).toBeVisible();
   });


   // Test fails on FireFox
   test('file upload test', async ({ page }) => {
      await page.locator('#upload').nth(0).setInputFiles(path.join(__dirname, 'test-image01.jpeg'));
      await page.locator('button:has-text("Submit File")').click();
      await page.waitForLoadState('networkidle');

      expect(await page.locator(`img[src="${testImage}"]`).isVisible());
   });
});

// Test fails on FireFox
test('upload incorrect file type', async ({ page }) => {
   await page.setInputFiles('input[type=file]', path.join(__dirname, 'bad-img.jleg'));
   await page.click('text=Submit File');
   await page.waitForLoadState('networkidle');

   const isImageDisplayed = await page.locator(`img[src="${testImage}"]`).isVisible();
   const imgIssue = await page.getByAltText('issue').nth(0).isVisible();
   const response = await page.locator(`text=${errorText}`).isVisible();

   expect(response).toBeTruthy();
   expect(imgIssue).toBeTruthy();
   expect(isImageDisplayed).toBeFalsy();


});
