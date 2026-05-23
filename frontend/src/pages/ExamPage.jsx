import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useTimer } from '../hooks/useTimer';
import { useAntiCheat } from '../hooks/useAntiCheat';
import ScientificCalculator from '../components/ScientificCalculator';
import BadgeUnlockModal from '../components/BadgeUnlockModal';

export default function ExamPage({ type = 'quiz' }) {
  const { level, attemptId: paramId } = useParams();
  const navigate = useNavigate();
  const [attemptId, setAttemptId] = useState(paramId);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [started, setStarted] = useState(false);
  const [badge, setBadge] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const timeLimit = type === 'mock' ? 180 * 60 : 45 * 60;
  const { formatted, seconds } = useTimer(timeLimit, () => {}, started);

  const handleSubmit = useCallback(async (auto = false) => {
    if (submitting || !attemptId) return;
    setSubmitting(true);
    const endpoint = type === 'mock' ? `/mock/${attemptId}/submit` : `/quiz/${attemptId}/submit`;
    const timeSpent = Math.max(0, timeLimit - seconds);
    try {
      const { data } = await api.post(endpoint, { timeSpentSec: timeSpent, autoSubmit: auto });
      if (data.badgeEarned) setBadge(data.badgeEarned);
      else navigate(type === 'mock' ? `/eamcet/mock/result/${attemptId}` : `/eamcet/quiz/${level}/result/${attemptId}`, { state: { result: data } });
    } catch (e) {
      alert(e.response?.data?.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  }, [attemptId, type, level, navigate, submitting, timeLimit, seconds]);

  useEffect(() => {
    if (seconds === 0 && started && attemptId) handleSubmit(true);
  }, [seconds, started, attemptId]);
  const onAutoSubmit = useCallback((result) => {
    navigate(type === 'mock' ? `/eamcet/mock/result/${attemptId}` : `/eamcet/quiz/${level}/result/${attemptId}`, { state: { result } });
  }, [attemptId, type, level, navigate]);

  const { warning, enterFullscreen, violations } = useAntiCheat(attemptId, type, onAutoSubmit);

  useEffect(() => {
    if (paramId) {
      const ep = type === 'mock' ? `/mock/${paramId}` : `/quiz/${paramId}`;
      api.get(ep).then((r) => {
        setAttemptId(r.data.attemptId);
        setQuestions(r.data.questions);
      });
      return;
    }
    const startEp = type === 'mock' ? '/mock/start' : '/quiz/start';
    const body = type === 'mock' ? {} : { level };
    api.post(startEp, body).then((r) => {
      setAttemptId(r.data.attemptId);
      setQuestions(r.data.questions);
    }).catch((e) => alert(e.response?.data?.message || 'Cannot start'));
  }, [level, paramId, type]);

  const saveAnswer = async (qId, opt) => {
    setAnswers((a) => ({ ...a, [qId]: opt }));
    const ep = type === 'mock' ? `/mock/${attemptId}/answer` : `/quiz/${attemptId}/answer`;
    await api.patch(ep, { questionId: qId, selectedOption: opt });
  };

  const startExam = async () => {
    await enterFullscreen();
    setStarted(true);
  };

  if (!questions.length) return <div className="text-center py-20">Loading exam...</div>;

  if (!started) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <h2 className="text-2xl font-bold text-navy mb-4">{type === 'mock' ? 'EAMCET Mock Test' : `${level} Quiz`}</h2>
        <p className="text-navy/60 mb-6">{questions.length} questions • Fullscreen required • Anti-cheat enabled</p>
        <button onClick={startExam} className="bg-navy text-gold px-8 py-4 rounded-2xl font-bold">Enter Fullscreen & Start</button>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="exam-mode fixed inset-0 bg-white z-40 flex flex-col">
      {warning && (
        <div className="bg-red-600 text-white text-center py-2 font-semibold">{warning}</div>
      )}
      <div className="bg-navy text-white px-6 py-3 flex justify-between items-center">
        <span>Q {current + 1} / {questions.length}</span>
        <span className="font-mono text-gold">{formatted}</span>
        <span className="text-sm">Violations: {violations}/3</span>
      </div>

      <div className="flex-1 overflow-auto p-8 max-w-3xl mx-auto w-full">
        <p className="text-lg font-medium text-navy mb-6">{q.question_text}</p>
        {['A', 'B', 'C', 'D'].map((opt) => {
          const key = `option_${opt.toLowerCase()}`;
          const selected = answers[q.id] === opt;
          return (
            <button
              key={opt}
              onClick={() => saveAnswer(q.id, opt)}
              className={`w-full text-left p-4 mb-3 rounded-xl border-2 transition ${
                selected ? 'border-gold bg-gold/10' : 'border-navy/10 hover:border-navy/30'
              }`}
            >
              <span className="font-bold text-gold mr-2">{opt}.</span> {q[key]}
            </button>
          );
        })}
      </div>

      <div className="border-t p-4 flex justify-between max-w-3xl mx-auto w-full">
        <button
          disabled={current === 0}
          onClick={() => setCurrent((c) => c - 1)}
          className="px-6 py-2 border border-navy rounded-xl disabled:opacity-30"
        >
          Previous
        </button>
        {current < questions.length - 1 ? (
          <button onClick={() => setCurrent((c) => c + 1)} className="px-6 py-2 bg-navy text-gold rounded-xl">
            Next
          </button>
        ) : (
          <button onClick={() => handleSubmit(false)} disabled={submitting} className="px-6 py-2 bg-gold text-navy rounded-xl font-bold">
            Submit
          </button>
        )}
      </div>

      <ScientificCalculator />
      <BadgeUnlockModal badge={badge} onClose={() => navigate(`/eamcet/quiz/${level}/result/${attemptId}`)} />
    </div>
  );
}
