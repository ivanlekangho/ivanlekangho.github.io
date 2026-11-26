/**
 * A deliberately loud placeholder — and only while developing.
 *
 * The rule was already written here: "if a reader ever sees one of these,
 * something shipped that shouldn't have." It shipped anyway. Every one of
 * these has been on the live site in a yellow box reading NEEDS YOUR
 * CONTENT, which is a note from me to Ivan printed on his portfolio for
 * anyone who opened it.
 *
 * So it follows the rule the attachment row already followed: present
 * while the site is being worked on, absent from the build. The notes
 * still do their job — they are for the person running `npm run dev` —
 * and they stop being a visitor's problem.
 */
export default function Todo({ children }: { children: React.ReactNode }) {
  if (!import.meta.env.DEV) return null
  return (
    <p className="todo">
      <b>needs your content</b>
      <br />
      {children}
    </p>
  )
}
