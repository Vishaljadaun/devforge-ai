import {useState} from 'react';
import {BookOpenCheck,CheckCircle2,Code2,RotateCcw} from 'lucide-react';
import {practiceLabs} from './data/practice';
import type {PracticeQuestion} from './data/practice';
import './topic-practice.css';

export type PracticeResult={bestScore:number;latestScore:number;total:number;attempts:number;lastAttemptAt:string};
type Props={topicId:string;previous?:PracticeResult;onSubmit:(score:number,total:number)=>void};

export function scorePractice(questions:PracticeQuestion[],answers:Record<string,number>):number{
  return questions.filter(question=>answers[question.id]===question.correct).length;
}

export default function TopicPractice({topicId,previous,onSubmit}:Props){
  const lab=practiceLabs[topicId];
  const [answers,setAnswers]=useState<Record<string,number>>({});
  const [submitted,setSubmitted]=useState(false);
  if(!lab)return null;
  const allAnswered=lab.questions.every(q=>Number.isInteger(answers[q.id]));
  const score=scorePractice(lab.questions,answers);
  return <section className="practice-lab" aria-label={`Interactive practice: ${lab.title}`}>
    <div className="practice-eyebrow"><Code2 size={16}/> INTERACTIVE PRACTICE LAB</div>
    <h3>{lab.title}</h3>
    <p className="practice-goal">{lab.goal}</p>
    <h4>Why it matters</h4>
    <ul>{lab.concepts.map(c=><li key={c}>{c}</li>)}</ul>
    <h4>Set up on your computer</h4><p>{lab.setup}</p>
    <pre className="code-pane"><code>{lab.starter}</code></pre>
    <h4>Build it yourself</h4><p>{lab.task}</p>
    <div className="practice-verify"><BookOpenCheck size={18}/><p><strong>Definition of done:</strong> {lab.verify}</p></div>
    <p className="practice-disclaimer">Code runs in your local Python environment, not in this browser. The quiz checks understanding; it does not execute or grade your code.</p>
    <div className="practice-check-heading"><h4>Knowledge check</h4>{previous&&<span>Best: {previous.bestScore}/{previous.total} · {previous.attempts} attempt(s)</span>}</div>
    {lab.questions.map((question,index)=><fieldset className="practice-question" key={question.id}>
      <legend>{index+1}. {question.prompt}</legend>
      {question.choices.map((choice,i)=><label key={i} className={`practice-answer ${submitted&&i===question.correct?'correct':''} ${submitted&&answers[question.id]===i&&i!==question.correct?'incorrect':''}`}>
        <input type="radio" name={`${topicId}-${question.id}`} checked={answers[question.id]===i} disabled={submitted} onChange={()=>setAnswers(prev=>({...prev,[question.id]:i}))}/>{choice}
      </label>)}
      {submitted&&<p className="practice-explanation"><CheckCircle2 size={16}/>{question.explanation}</p>}
    </fieldset>)}
    <div className="practice-actions">
      {submitted?<><strong role="status">Score: {score}/{lab.questions.length} ({Math.round(score/lab.questions.length*100)}%)</strong><button className="btn btn-outline" onClick={()=>{setAnswers({});setSubmitted(false)}}><RotateCcw size={15}/> Try again</button></>
      :<button className="btn btn-primary" disabled={!allAnswered} onClick={()=>{setSubmitted(true);onSubmit(score,lab.questions.length)}}>Check answers</button>}
    </div>
    {!allAnswered&&!submitted&&<p className="practice-hint">Answer every question to check your work.</p>}
  </section>;
}