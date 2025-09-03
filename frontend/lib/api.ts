import type { APIResponse, InterviewSession, InterviewQuestion, InterviewResponse } from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

class APIClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || "Request failed",
          message: data.message,
        }
      }

      return {
        success: true,
        data: data.data || data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      }
    }
  }

  // Interview Session Management
  async createSession(userId: string): Promise<APIResponse<InterviewSession>> {
    return this.request<InterviewSession>("/sessions", {
      method: "POST",
      body: JSON.stringify({ userId }),
    })
  }

  async getSession(sessionId: string): Promise<APIResponse<InterviewSession>> {
    return this.request<InterviewSession>(`/sessions/${sessionId}`)
  }

  async updateSession(sessionId: string, updates: Partial<InterviewSession>): Promise<APIResponse<InterviewSession>> {
    return this.request<InterviewSession>(`/sessions/${sessionId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    })
  }

  async endSession(sessionId: string): Promise<APIResponse<InterviewSession>> {
    return this.request<InterviewSession>(`/sessions/${sessionId}/end`, {
      method: "POST",
    })
  }

  // Question Management
  async getNextQuestion(sessionId: string): Promise<APIResponse<InterviewQuestion>> {
    return this.request<InterviewQuestion>(`/sessions/${sessionId}/next-question`)
  }

  async generateQuestionAudio(questionId: string): Promise<APIResponse<{ audioUrl: string }>> {
    return this.request<{ audioUrl: string }>(`/questions/${questionId}/audio`, {
      method: "POST",
    })
  }

  // Response Management
  async submitResponse(
    sessionId: string,
    questionId: string,
    transcriptText: string,
    audioBlob?: Blob,
  ): Promise<APIResponse<InterviewResponse>> {
    const formData = new FormData()
    formData.append("sessionId", sessionId)
    formData.append("questionId", questionId)
    formData.append("transcriptText", transcriptText)

    if (audioBlob) {
      formData.append("audio", audioBlob, "response.wav")
    }

    return fetch(`${API_BASE_URL}/responses`, {
      method: "POST",
      body: formData,
    })
      .then(async (response) => {
        const data = await response.json()
        return {
          success: response.ok,
          data: response.ok ? data.data : undefined,
          error: response.ok ? undefined : data.error,
        }
      })
      .catch((error) => ({
        success: false,
        error: error.message,
      }))
  }

  async getSessionResponses(sessionId: string): Promise<APIResponse<InterviewResponse[]>> {
    return this.request<InterviewResponse[]>(`/sessions/${sessionId}/responses`)
  }

  // Analytics and Feedback
  async getSessionAnalytics(sessionId: string): Promise<APIResponse<any>> {
    return this.request(`/sessions/${sessionId}/analytics`)
  }
}

export const apiClient = new APIClient()
