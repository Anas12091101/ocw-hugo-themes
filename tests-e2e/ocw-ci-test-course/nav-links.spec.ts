import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test("Navbar links working properly", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("")

  const navbar = await page
    .locator("#course-main-content div")
    .filter({
      hasText:
        "Section 1 Menu Title Subsection 1a Menu Title Subsection 1b Menu Title Section 2",
    })
    .nth(3)
  const linkCount = await navbar.locator("a").count()
  for (let i = 0; i < linkCount; i++) {
    const link = await navbar.locator("a").nth(i)
    const url = await link.getAttribute("href")
    const goto_url = url?.replace("/courses/ocw-ci-test-course/", "")
    const response = await course.goto(goto_url)
    await expect(response?.status()).toBeLessThan(400)
    await expect(page.url()).toContain(url)
  }
})

test("Navbar Expanding Properly", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("")

  const expandBtn = page.getByRole("button", {
    name: "Subsections for Section 1 Menu Title",
  })
  await expandBtn.click()
  const subHeading = await page.getByRole("link", {
    name: "Subsection 1a Menu Title",
  })
  await expect(subHeading).toBeVisible()
  await expandBtn.click()
  await expect(subHeading).toBeHidden()
})
