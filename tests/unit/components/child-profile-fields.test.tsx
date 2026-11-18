import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { ChildProfileFields } from "@/components/profiles/child-profile-fields"

const names = ["BraveTiger51", "HappyDolphin56", "SwiftPlanet40"]

function submittedName(container: HTMLElement) {
  return container.querySelector<HTMLInputElement>('input[type="hidden"][name="displayName"]')?.value
}

describe("ChildProfileFields explorer name", () => {
  it("submits the selected suggestion by default", () => {
    const { container } = render(<ChildProfileFields initialNames={names} />)
    expect(submittedName(container)).toBe("BraveTiger51")
    expect(screen.queryByLabelText("Your explorer name")).toBeNull()
  })

  it("lets a parent type their own name and submits it trimmed", async () => {
    const user = userEvent.setup()
    const { container } = render(<ChildProfileFields initialNames={names} />)

    await user.click(screen.getByRole("radio", { name: "Type my own…" }))
    await user.type(screen.getByLabelText("Your explorer name"), "  Space Captain 7 ")
    expect(submittedName(container)).toBe("Space Captain 7")

    await user.click(screen.getByRole("radio", { name: "HappyDolphin56" }))
    expect(screen.queryByLabelText("Your explorer name")).toBeNull()
    expect(submittedName(container)).toBe("HappyDolphin56")
  })

  it("keeps an existing typed name selected when editing a profile", () => {
    const { container } = render(
      <ChildProfileFields initialNames={names} defaults={{ displayName: "Zed" }} />
    )
    expect(screen.getByRole("radio", { name: "Zed" })).toBeChecked()
    expect(submittedName(container)).toBe("Zed")
  })
})
