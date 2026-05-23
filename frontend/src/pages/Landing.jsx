import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Trophy, Shield } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-navy text-white px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <GraduationCap className="text-gold" />
          <span className="font-bold">AP Inter & EAMCET Portal</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="text-white/80 hover:text-gold">Student Login</Link>
          <Link to="/admin/login" className="bg-gold text-navy px-4 py-2 rounded-lg font-semibold">Admin</Link>
        </div>
      </nav>

      <section className="px-8 py-20 max-w-6xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold text-navy mb-6"
        >
          Smart Preparation for <span className="text-gold">AP Inter</span> & <span className="text-gold">EAMCET</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-navy/70 mb-10 max-w-2xl mx-auto"
        >
          Premium educational platform for Andhra Pradesh Intermediate students. Syllabus, PYQs, adaptive quizzes, and full mock tests.
        </motion.p>
        <Link
          to="/login"
          className="inline-block bg-navy text-gold px-10 py-4 rounded-2xl font-bold text-lg shadow-premium hover:scale-105 transition"
        >
          Start Learning
        </Link>
      </section>

      <section className="bg-navy text-white py-16 px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { icon: BookOpen, title: 'IPE Module', desc: 'Syllabus, PYQs & Important Questions' },
            { icon: Trophy, title: 'EAMCET Quiz', desc: '3 levels with Bronze, Silver, Gold badges' },
            { icon: Shield, title: 'Anti-Cheat Mock', desc: '160Q fullscreen exam with rank system' },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 rounded-2xl p-8 border border-gold/20"
            >
              <f.icon className="text-gold mb-4" size={36} />
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-white/70">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
