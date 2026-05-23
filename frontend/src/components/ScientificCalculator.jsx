import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, X } from 'lucide-react';

export default function ScientificCalculator() {
  const [open, setOpen] = useState(false);
  const [display, setDisplay] = useState('0');

  const press = (val) => {
    if (val === 'C') setDisplay('0');
    else if (val === '=') {
      try {
        const result = Function(`"use strict"; return (${display.replace(/×/g, '*').replace(/÷/g, '/')})`)();
        setDisplay(String(result));
      } catch {
        setDisplay('Error');
      }
    } else setDisplay(display === '0' ? val : display + val);
  };

  const keys = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+', 'C'];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gold text-navy p-4 rounded-full shadow-premium hover:scale-105 transition"
      >
        <Calculator size={24} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-6 z-50 bg-navy text-white rounded-2xl shadow-premium p-4 w-64"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gold">Calculator</span>
              <button onClick={() => setOpen(false)}><X size={18} /></button>
            </div>
            <div className="bg-white/10 rounded-lg p-3 mb-3 text-right font-mono text-lg overflow-hidden">{display}</div>
            <div className="grid grid-cols-4 gap-2">
              {keys.map((k) => (
                <button
                  key={k}
                  onClick={() => press(k)}
                  className={`py-2 rounded-lg font-medium ${k === '=' || k === 'C' ? 'bg-gold text-navy' : 'bg-white/10 hover:bg-white/20'}`}
                >
                  {k}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
