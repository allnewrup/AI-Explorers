import { Spark } from "@/components/mascot/spark"

export default function Page() {
  return (
    <main id="main-content" className="container-page flex flex-1 flex-col items-center justify-center gap-6 py-24 text-center">
      <Spark mood="wave" title="Spark the robot waving" />
      <h1 className="text-4xl font-bold">AI Explorers</h1>
    </main>
  )
}
