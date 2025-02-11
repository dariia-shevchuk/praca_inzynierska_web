"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { auth, db } from '@/firebaseConfig';
import { doc, collection, addDoc, getDoc, updateDoc, setDoc, setIndexConfiguration } from 'firebase/firestore';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/texarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner"
import { onAuthStateChanged } from "firebase/auth";


const CreatingLecturesScreen = () => {
    const [teacherGroups, setTeacherGroups] = useState([]);
    const [questionTitle, setQuestionTitle] = useState('');
    const [answers, setAnswers] = useState([]);
    const [text, setText] = useState('');
    const [title, setTitle] = useState('');
    const [isTest, setIsTest] = useState(false);
    const [test, setTest] = useState([])
    const [inputHeight1, setInputHeight1] = useState(45);
    const [inputHeight2, setInputHeight2] = useState(45);
    const [inputHeight3, setInputHeight3] = useState(45);
    const [privacy, setPrivacy] = useState(''); 
    const [isPracticum, setIsPracticum] = useState(false);
    const [isLecture, setIsLecture] = useState(false);
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [practicumQuestion, setPracticumQuestion] = useState('');
    const [group, setGroup] = useState('');
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
                    console.log(groups);
                    // const studentIds = [...new Set(marks.map(mark => mark.id))];
                    if (groups){
                        console.log(groups);
                        const teacherGroups = groups.map(group => group.id);
                        setTeacherGroups(teacherGroups);
                    }
                } else {
                }
            } catch (error) {
            }
        };
      });
        return () => unsubscribe();
    }, []);


    
    const updateTest = async () => {
        if (auth.currentUser) {
            const userId = auth.currentUser.uid;
            const testsCollectionRef = collection(db, "lectures");
            const userDocRef = doc(db, "teacherTests", userId);
            try {
                const userDoc = await getDoc(userDocRef);
                const docRef = await addDoc(testsCollectionRef, { materials: test, title: title, privacy: privacy });
                let newTests = [];
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const tests = userData.tests || [];
                    if (privacy === 'with'){
                        newTests = [...tests, { id: docRef.id, type: 'practicum' }];
                    } else {
                        newTests = [...tests, { id: docRef.id, type: 'lectures' }];
                    }
                    await updateDoc(userDocRef, {
                        tests: newTests,
                    });  // Replace 'test-id' and 'score' with actual values
                } else {
                    if (privacy === 'with'){
                        newTests = [ {id: docRef.id, type: 'practicum'} ];
                    } else {
                        newTests = [ {id: docRef.id, type: 'lectures'} ];
                    }
                    await setDoc(userDocRef, {
                        tests: newTests,
                    });  // Replace 'test-id' and 'score' with actual values
                }
                
                toast("Successfully added");
            } catch (error) {
              toast("Error adding", {
              description: "If the error persists, contact your administrator"});
            }
            setTest([])
            setTitle('')
            setIsTest(false);
            setIsPracticum(false);
            setIsLecture(false);
            setPrivacy('');
            router.push("/");
        }
    };
    
   

    
    const addQuestion = () => {
        let newQuestion;
        if (questionTitle !== "" && text !== "" && privacy === "without"){
            newQuestion = {title : questionTitle, text : text};
            setTest(prevTest => [...prevTest, newQuestion]);
            setQuestionTitle('');
            setAnswers([{ text: '' }]); // Reset answers
            setCorrectAnswer('');
            setPracticumQuestion('');
            setInputHeight1(45)
            setInputHeight2(45)
            setInputHeight3(45)
            setText('');
        }else if(questionTitle !== "" && text !== "" && practicumQuestion !== "" && correctAnswer !== ""){
            newQuestion = { title : questionTitle, text : text, practicumQuestion: practicumQuestion, correctAnswer: correctAnswer};
            setTest(prevTest => [...prevTest, newQuestion]);
            setQuestionTitle('');
            setAnswers([{ text: '' }]); // Reset answers
            setCorrectAnswer('');
            setPracticumQuestion('');
            setInputHeight1(45)
            setInputHeight2(45)
            setInputHeight3(45)
            setText('');
        } else {
            toast("Error", {
              description: "Fill in all fields"});
        }
    }
    
    const setPrivacyTest = (privacy) => {
        setPrivacy(privacy);
        if (privacy === "with") {
            setIsPracticum(true);
        }
    }
    
    const createTest = () => {
        if (title !== ""){
            setIsLecture(true);
        } else {
            toast("Error", {
              description: "Fill in the title field"});
        }
    }

    const reset = () => {
        setQuestionTitle('');
        setAnswers([{ text: '' }]); // Reset answers
        setCorrectAnswer('');
        setPracticumQuestion('');
        setInputHeight1(45)
        setInputHeight2(45)
        setInputHeight3(45)
        setText('');
        setTest([])
        setTitle('')
        setIsTest(false);
        setIsPracticum(false);
        setIsLecture(false);
        setPrivacy('');
    }
    

    return (
      <div className=" h-screen w-full">
        <Card className="p-6 max-w-2xl mx-auto">
            {isLecture ? (
                isPracticum ? (
                    <>
                        <h2 className="text-xl font-semibold mb-4">{title}</h2>
                        <Textarea 
                            placeholder="Topic name"
                            value={questionTitle}
                            onChange={(e) => setQuestionTitle(e.target.value)}
                            className="mb-3 rounded-lg"
                        />
                        <Textarea 
                            placeholder="Theme Material"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="mb-3 rounded-lg"
                        />
                        <Textarea 
                            placeholder="Task for work"
                            value={practicumQuestion}
                            onChange={(e) => setPracticumQuestion(e.target.value)}
                            className="mb-3 rounded-lg"
                        />
                        <Input 
                            placeholder="Answer to the problem"
                            value={correctAnswer}
                            onChange={(e) => setCorrectAnswer(e.target.value)}
                            className="mb-3"
                        />
                        <Button onClick={addQuestion} className="w-full mb-2">Add theme</Button>
                        <Button onClick={updateTest} className="w-full mb-2">Create a work</Button>
                        <Button  variant="destructive" onClick={reset} className="w-full">Cancel creation</Button>
                    </>
                ) : (
                    <>
                        <h2 className="text-xl font-semibold mb-4">{title}</h2>
                        <Textarea 
                            placeholder="Topic name"
                            value={questionTitle}
                            onChange={(e) => setQuestionTitle(e.target.value)}
                            className="mb-3 rounded-lg"
                        />
                        <Textarea 
                            placeholder="Theme Material"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="mb-3 rounded-lg"
                        />
                        <Button onClick={addQuestion} className="w-full mb-2">Add theme</Button>
                        <Button onClick={updateTest} className="w-full mb-2">Create a lecture</Button>
                        <Button variant="destructive" onClick={reset} className="w-full">Cancel creation</Button>
                    </>
                )
            ) : (
                privacy ? (
                    <>
                        <Input 
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mb-3"
                        />
                        <Button onClick={createTest} className="w-full mb-2">Add title</Button>
                        <Button variant="destructive" onClick={reset} className="w-full mb-2">Cancel creation</Button>
                    </>
                ) : (
                    <>
                        <Button onClick={() => setPrivacyTest("without")} className="w-full mb-2">Create a lecture</Button>
                        <Button onClick={() => setPrivacyTest("with")} className="w-full mb-2">Create a work</Button>
                    </>
                )
            )}
        </Card>
      </div>
    );
};

export default CreatingLecturesScreen;