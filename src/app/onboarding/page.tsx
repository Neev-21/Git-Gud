'use client'

import { useState } from 'react'
import { Code, Server, Layers, Database, Shield, ChevronRight } from 'lucide-react'
import { selectClass } from './actions'

const RPG_CLASSES = [
  { id: 'frontend', name: 'Front-End Sorcerer', icon: Code, description: 'Master of the DOM and visual arts.' },
  { id: 'backend', name: 'Back-End Berserker', icon: Server, description: 'Crusher of data, ruler of servers.' },
  { id: 'fullstack', name: 'Full-Stack Paladin', icon: Layers, description: 'Balanced warrior of all domains.' },
  { id: 'data', name: 'Data Mage', icon: Database, description: 'Weaver of pipelines and analytics.' },
  { id: 'devops', name: 'DevOps Ranger', icon: Shield, description: 'Protector of deployments and infra.' },
]

export default function OnboardingPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-12">
        <div className="text-center space-y-4 pt-12">
          <h1 className="text-4xl md:text-5xl font-mono font-bold text-white uppercase tracking-tight">Choose Your Class</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Your journey begins here. Select the path that aligns with your skills and shape your destiny in the tavern.
          </p>
        </div>

        <form 
          action={async (formData) => {
            if (!selected) return;
            setIsLoading(true)
            formData.append('class', selected)
            await selectClass(formData)
            setIsLoading(false) // Just in case it errors
          }}
          className="space-y-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {RPG_CLASSES.map((c) => {
              const Icon = c.icon
              const isSelected = selected === c.name
              return (
                <div 
                  key={c.id}
                  onClick={() => setSelected(c.name)}
                  className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.2)] scale-105' 
                      : 'border-slate-800 bg-slate-800/50 hover:border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <div className={`p-3 rounded-xl inline-block mb-4 transition-colors ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold font-mono text-white mb-2">{c.name}</h3>
                  <p className="text-sm text-slate-400">{c.description}</p>
                  
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex justify-center pt-8 border-t border-slate-800">
            <button
              type="submit"
              disabled={!selected || isLoading}
              className={`group flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                selected && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Entering...' : 'Begin Journey'}
              {!isLoading && <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
