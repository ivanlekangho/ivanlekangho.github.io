/** A deliberately loud placeholder. If a reader ever sees one of these,
 *  something shipped that shouldn't have. */
export default function Todo({ children }: { children: React.ReactNode }) {
  return (
    <p className="todo">
      <b>needs your content</b>
      <br />
      {children}
    </p>
  )
}
