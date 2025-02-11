"use client";

import { useState, useEffect, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebaseConfig";
import { doc, collection, addDoc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { toast } from "sonner"
import { onAuthStateChanged } from "firebase/auth";

const LearningAddingScreen = () => {
  const [teacherGroups, setTeacherGroups] = useState<string[]>([]);
  const [questionTitle, setQuestionTitle] = useState("");
  const [answers, setAnswers] = useState([{ text: "" }]);
  const [title, setTitle] = useState("");
  const [isTest, setIsTest] = useState(false);
  const [test, setTest] = useState<{ question: string; answer: string; options: string[] }[]>([]);
  const [privacy, setPrivacy] = useState("teacher");
  const [isPrivacy, setIsPrivacy] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [group, setGroup] = useState("");
  const [isGroup, setIsGroup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userId = auth.currentUser?.uid;
          if (!userId) return;
          const teacherRef = doc(db, 'users', userId);
          const teacherSnapshot = await getDoc(teacherRef);
          const teacher = teacherSnapshot.data();
          
          if (teacher) {
              // Extract marks (student IDs and scores)
              const groups = teacher.groups;
              console.log(teacher)
              console.log(groups);
              // const studentIds = [...new Set(marks.map(mark => mark.id))];
              if (groups){
                  console.log(groups);
                    const teacherGroups: string[] = groups.map((group: { id: string }) => group.id);
                  setTeacherGroups(teacherGroups.reverse());
              }
          } else {
          }
        } catch (error) {
          console.error("Error fetching teacher groups", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const updateTest = async () => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const testsCollectionRef = collection(db, "tests");
    const userDocRef = doc(db, "teacherTests", userId);
    try {
      const docRef = await addDoc(testsCollectionRef, {
        questions: test,
        title,
        privacy,
        ...(privacy === "teacher" && { group }),
      });
      const userDoc = await getDoc(userDocRef);
      let newTests = userDoc.exists()
        ? [...userDoc.data().tests, { id: docRef.id, type: "tests", ...(privacy === "teacher" && { group }) }]
        : [{ id: docRef.id, type: "tests", ...(privacy === "teacher" && { group }) }];

      await setDoc(userDocRef, { tests: newTests }, { merge: true });
      toast("Test added");
      reset();
      router.push("/");
    } catch (error) {
      toast("Error adding test", {
        description: "If the error persists, contact your administrator"});
    }
  };

  const setPrivacyTest = (privacy: SetStateAction<string>) => {
    setPrivacy(privacy);
    setIsPrivacy(true);
    if( privacy === 'teacher'){
        setIsGroup(true);
    }
  }

  const chooseGroup = (id: SetStateAction<string>) => {
    setGroup(id);
    setIsGroup(false);
}

  const addQuestion = () => {
    if (!questionTitle || !correctAnswer || answers.some((a) => !a.text)) {
      toast("Error", {
        description: "Fill in all fields"});
      return;
    }
    setTest([...test, { question: questionTitle, answer: correctAnswer, options: answers.map((a) => a.text) }]);
    setQuestionTitle("");
    setAnswers([{ text: "" }]);
    setCorrectAnswer("");
  };

  const addAnswerField = () => {
    setAnswers([...answers, { text: "" }]);
  };

  interface Answer {
    text: string;
  }

  interface Test {
    question: string;
    answer: string;
    options: string[];
  }

  const updateAnswer = (text: string, index: number) => {
    const newAnswers: Answer[] = [...answers];
    newAnswers[index].text = text;
    setAnswers(newAnswers);
  };

  const reset = () => {
    setTest([]);
    setTitle("");
    setIsTest(false);
    setIsPrivacy(false);
    setQuestionTitle("");
    setAnswers([{ text: "" }]);
    setCorrectAnswer("");
  };

  return (
    <div className="h-screen w-full">
    <Card className="p-6 max-w-2xl mx-auto">
      {isTest ? (
        <ScrollArea className="max-h-[400px]">
          <h1 className="text-xl font-semibold mb-4">{title}</h1>
          <Input placeholder="Question text" value={questionTitle} className="w-full mb-3" onChange={(e) => setQuestionTitle(e.target.value)} />
          {answers.map((item, index) => (
            <Input key={index} placeholder={`Answer ${index + 1}`}className="w-full mb-3" value={item.text} onChange={(e) => updateAnswer(e.target.value, index)} />
          ))}
          <Button onClick={addAnswerField}className="w-full mb-2">Add an answer option</Button>
          <Input 
              placeholder="Correct answer" value={correctAnswer} className="w-full mb-3" onChange={(e) => setCorrectAnswer(e.target.value)} />
          <Button onClick={addQuestion} className="w-full mb-2">Add a question</Button>
          <Button onClick={updateTest} className="w-full mb-2">Create a test</Button>
          <Button variant="destructive" onClick={reset} className="w-full">Cancel creation</Button>
        </ScrollArea>
      ) : isPrivacy ? (
        isGroup ? (
          <ScrollArea className="max-h-[400px]">
            {teacherGroups.length > 0 ? (
              teacherGroups.map((group, index) => (
                <Button key={index} onClick={() => chooseGroup(group)}>{`Group: ${group}`}</Button>
              ))
            ) : (
              <>
                <p>No group found.</p>
                <Button variant="destructive" onClick={reset} className="w-full">Cancel creation</Button>
              </>
            )}
          </ScrollArea>
        ) : (
          <>
            <Input placeholder="Title" value={title} className="mb-3" onChange={(e) => setTitle(e.target.value)} />
            <Button onClick={() => setIsTest(true)} className="w-full mb-2">Create test</Button>
            <Button variant="destructive" onClick={reset}>Cancel creation</Button>
          </>
        )
      ) : (
        <>
          <Button onClick={() => setPrivacyTest("public")} className="w-full mb-2">Create public test</Button>
          <Button onClick={() => { setPrivacyTest("teacher") }} className="w-full mb-2">Create private test</Button>
        </>
      )}
    </Card>
    </div>
  );
};

export default LearningAddingScreen;
