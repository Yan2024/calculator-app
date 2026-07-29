import { Calculator } from './features/calculator/Calculator'

function App() {
  return (
    <main
      className="
        flex min-h-screen items-center justify-center
        bg-slate-100 p-4 sm:p-6
      "
    >
      <div className="w-full max-w-md">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-slate-950">
            Calculator
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Simple calculations, powered by a Go API
          </p>
        </header>

        <Calculator />
      </div>
    </main>
  )
}

export default App
