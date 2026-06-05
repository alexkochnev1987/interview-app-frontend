'use client'

import {useMutation} from "@tanstack/react-query";
import {draftQuestion, QuestionInput} from "@/lib/api";

export function useDraftQuestion() {
    return useMutation({
        mutationFn:(value:QuestionInput)=> draftQuestion((value))
    })
}