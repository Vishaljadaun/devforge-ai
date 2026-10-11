import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {practiceLabs,requiredPracticeScore,hasPassedPractice,reconcileCompletedTopics} from '../src/data/practice.ts';
const app=readFileSync('src/App.tsx','utf8');
const modal=readFileSync('src/TopicPractice.tsx','utf8');

test('four current Python labs require 2 of 3 correct',()=>{
  assert.deepEqual(Object.keys(practiceLabs),['python:0','python:1','python:2','python:3']);
  for(const id of Object.keys(practiceLabs))assert.equal(requiredPracticeScore(id),2);
  assert.equal(requiredPracticeScore('python:4'),null);
  assert.equal(requiredPracticeScore('rag:0'),null);
});

test('failed and malformed attempts never count as passing',()=>{
  assert.equal(hasPassedPractice('python:0',{bestScore:1,total:3}),false);
  assert.equal(hasPassedPractice('python:0',{bestScore:2,total:2}),false);
  assert.equal(hasPassedPractice('python:0',{bestScore:4,total:3}),false);
  assert.equal(hasPassedPractice('python:0',undefined),false);
  assert.equal(hasPassedPractice('python:0',{bestScore:2,total:3}),true);
  assert.equal(hasPassedPractice('python:0',{bestScore:3,total:3}),true);
});

test('legacy manually checked gated topics are reconciled from saved attempts',()=>{
  const records={'python:0':{bestScore:1,total:3},'python:1':{bestScore:2,total:3}};
  assert.deepEqual(reconcileCompletedTopics(['python:0','python:2','python:4','python:4'],records),['python:4','python:1']);
  assert.deepEqual(reconcileCompletedTopics([],records),['python:1']);
});

test('topic UI disables manual completion and earned progress is recorded',()=>{
  assert.match(app,/doneTopics:reconcileCompletedTopics\(recordedTopics,topicPracticeResults\)/);
  assert.match(app,/if\(requiredPracticeScore\(id\)!==null\)\{notify/);
  assert.match(app,/const passed=passingScore!==null && total===practiceLabs\[id\]\.questions\.length && score>=passingScore/);
  assert.match(app,/doneTopics:passed&&!w\.doneTopics\.includes\(id\)/);
  assert.match(app,/if\(newlyCompleted\)trackActivity\('topic_completed',id\)/);
  assert.match(app,/disabled=\{gated\}/);
  assert.match(app,/Pass quiz to complete/);
  assert.match(modal,/Completion rule:/);
  assert.match(modal,/Not passed — try again/);
});
