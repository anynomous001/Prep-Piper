import TechStackForm from "@/components/tech-selection/tech-stack-form"

export default function TechSelectionPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="mb-6 text-3xl font-semibold text-zinc-100">Choose your interview</h1>
      <TechStackForm />
    </main>
  )
}
