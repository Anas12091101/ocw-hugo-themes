import * as path from "node:path"
import { promises as fs } from "node:fs"
import { test, expect } from "@playwright/test"
import recursiveReaddir from "recursive-readdir"

/**
 * See [fixtures readme](test-sites/__fixtures__/README.md). We want to make sure
 * that the fixtures are accurate
 */
test("The fixtures are what Hugo would produce.", async () => {
  const SKIP_DIRS = [
    "api/",
    /**
     * The two courses below are not built, they are just used as previews on
     * the test homepage.
     */
    "courses/some-featured-course",
    "courses/some-new-course"
  ]

  const fixtureDir = path.resolve(__dirname, "../test-sites/__fixtures__")
  const builtDir = path.resolve(__dirname, "../test-sites/tmp/dist")
  const filepaths: string[] = await recursiveReaddir(
    path.resolve(__dirname, "../test-sites/__fixtures__")
  )
  const jsonpaths = filepaths.filter(filepath => filepath.endsWith(".json"))
  const comparisons = await Promise.all(
    jsonpaths.map(async filepath => {
      const relative = path.relative(fixtureDir, filepath)
      if (SKIP_DIRS.some(dir => relative.startsWith(dir))) {
        return { fixture: null, built: null }
      }
      const fixtureText = await fs.readFile(filepath, "utf-8")
      const builtText = await fs.readFile(
        path.join(builtDir, relative),
        "utf-8"
      )
      try {
        return {
          fixture: JSON.parse(fixtureText),
          built:   JSON.parse(builtText)
        }
      } catch (err) {
        console.error(`Error parsing content of file ${filepath}`)
        throw err
      }
    })
  )

  comparisons.forEach(({ fixture, built }) => {
    expect(built).toEqual(fixture)
  })
})
