import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test("Navbar links working properly", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("")

  const linkNames = [
    "Section 2 Menu Title",
    "Section 1 Menu Title",
    "Subsection 1a Menu Title",
    "Subsection 1b Menu Title",
    "Section 2 Menu Title",
    "Shortcode Demos",
    "Subscripts and Superscripts",
    "Video Series Overview",
    "Multiple Videos Series Overview",
    "Resource List",
  ]

  for (const linkName of linkNames) {
    const link = page.getByRole("link", { name: linkName })
    const url = await link.getAttribute("href")

    await expect(url).toBeTruthy()

    const responsePromise = page.waitForResponse((response) =>
      response.url().endsWith(url!)
    )
    await link.click()
    const response = await responsePromise

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
  await new Promise((f) => setTimeout(f, 1000)) // 1 sec delay, without this test runs so fast and the next click event occurs when the button is disabled
  await expandBtn.click()
  await expect(subHeading).toBeHidden()
})
