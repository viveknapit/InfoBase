// ViewQuestionPage.tsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import DetailedQuestionCard from "../features/Questions/DetailedQuestionCard";
import AnswerCard from "../features/Answers/AnswerCard";
import { fetchAnswers, selectAnswersForQuestion } from "../redux/slices/AnswerSlice";
import { useParams } from "react-router-dom";

export default function ViewQuestionPage() {
  const dispatch = useDispatch<AppDispatch>();

  const {id} = useParams<{id:string}>();
  const questionId = Number(id);

  useEffect(() => {
    dispatch(fetchAnswers({ questionId }));
  }, [dispatch, questionId]);

  const answers = useSelector((s: RootState) => selectAnswersForQuestion(s, questionId)) ?? [];
  const loading = useSelector((s: RootState) => s.answers.loading);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Question (DetailedQuestionCard reads question by id and renders it) */}
        <DetailedQuestionCard questionId={questionId} />

        {/* Answers header */}
        <div className="mt-6 mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Answers ({answers.length})</h2>
          <div className="text-sm text-gray-500">Sorted by: votes</div>
        </div>

        {/* Answers list */}
        {loading ? (
          <div className="p-4 bg-white rounded shadow-sm text-sm text-gray-600">Loading answers...</div>
        ) : answers.length ? (
          <div className="space-y-4">
            {answers.map((ans: any) => (
              <AnswerCard key={ans.id} answerId={ans.id} />
            ))}
          </div>
        ) : (
          <div className="p-4 bg-white rounded shadow-sm text-sm text-gray-600">No answers yet.</div>
        )}
      </div>
    </div>
  );
}
