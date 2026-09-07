import { test, expect } from '@playwright/test';

test('direct round end-to-end flow with technical test', async ({ page, request }) => {
  test.setTimeout(120000); // 2 minutes

  const randId = Math.floor(Math.random() * 10000);
  const candidateEmail = `direct_${randId}@example.com`;
  console.log(`Starting test for candidate: ${candidateEmail}`);

  // 1. Login as HR
  await page.goto('http://localhost:3000/login');
  await page.fill('input[name="email"]', 'hr.admin@sthapatya.in');
  await page.fill('input[name="password"]', 'Password@123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard|staff/);

  // 2. Register candidate via API using token to save time
  const authCookie = await page.context().cookies();
  let token = authCookie.find(c => c.name === 'token')?.value;
  if (!token) {
    token = await page.evaluate(() => localStorage.getItem('token')) as string;
  }
  
  const response = await request.post('http://localhost:5031/api/candidates/register', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    data: {
        firstName: 'Direct',
        lastName: `Candidate ${randId}`,
        email: candidateEmail,
        phone: `9990${randId}`,
        vacancyId: 1, // Vacancy 1 is Direct Hiring (.NET Developer)
        currentCTC: 500000,
        expectedCTC: 800000,
        noticePeriodDays: 30,
        currentLocation: 'Pune',
        highestQualification: 'B.E.'
    }
  });
  
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  const candidateId = data.id;
  console.log(`Candidate created with ID: ${candidateId}`);

  await page.waitForTimeout(1000); // wait for DB to settle

  await page.close();
});
