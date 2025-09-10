'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import EvaluationResults from '../../components/evaluation/EvaluationResults'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

const EvaluationPageWrapper = () => {
  const router = useRouter();
  const [evaluationData, setEvaluationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Try to load evaluation data from localStorage
      const storedData = localStorage.getItem('prep-piper:evaluation-result');
      
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        console.log('📊 Loaded evaluation data:', parsedData);
        setEvaluationData(parsedData);
      } else {
        setError('No evaluation data found. Please complete an interview first.');
      }
    } catch (err) {
      console.error('❌ Error loading evaluation data:', err);
      setError('Failed to load evaluation data.');
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your evaluation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-4">Evaluation Not Found</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/interview')}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
              >
                Start New Interview
              </Button>
              <Button 
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <EvaluationResults data={evaluationData} />;
};

export default EvaluationPageWrapper;
