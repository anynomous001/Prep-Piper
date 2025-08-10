from typing import Annotated, TypedDict, List, Optional
from pydantic import BaseModel, Field
from enum import Enum


class ProficiencyLevel(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"
    expert = "expert"


class ConfidenceLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"


class TechnicalSkillAssessment(BaseModel):
    """Assessment of a specific technical skill"""
    skill_name: str = Field(description="Name of the technical skill")
    proficiency_level: ProficiencyLevel = Field(description="Proficiency level of the skill")
    evidence: List[str] = Field(description="List of evidence that supports this assessment of this technical skill")
    confidence: ConfidenceLevel = Field(description="Confidence level of the assessment")
    comments: str = Field(default="No additional comments", description="Comments on the assessment")

class ProblemSolvingInstance(BaseModel):
    """Specific instance of a problem solving"""
    problem_statement: str = Field(description="Statement of the problem")
    solution: str = Field(description="Solution to the problem")
    approach_quality: int = Field(ge=1, le=10, description="Quality of approach taken (1-10)")
    solution_effectiveness: int = Field(ge=1, le=10, description="Effectiveness of solution (1-10)")
    reasoning_clarity: int = Field(ge=1, le=10, description="Clarity of reasoning (1-10)")


class EvaluationWorkFlowState(BaseModel):
    """Single comprehensive state for the entire workflow - maintains all data throughout"""
    model_config = {"arbitrary_types_allowed": True}

    interview_data: dict = Field(description="Raw interview json data for evaluation")
    current_step: str = Field(description="Current step in the workflow")
    errors: List[str] = Field(default_factory=list, description="List of errors encountered during evaluation")

    problem_solving_instances: List[ProblemSolvingInstance] = Field(default_factory=list, description="List of problem solving instances")
    problem_solving_score: int = Field(default=0, ge=0, le=10, description="Overall score on problem solving")
    analytical_thinking_score: int = Field(default=0, ge=0, le=10, description="Overall score on analytical thinking")
    debugging_potential_score: int = Field(default=0, ge=0, le=10, description="debugging skill")

    technical_skills: List[TechnicalSkillAssessment] = Field(default_factory=list, description="List of technical skill assessments")
    technical_consistency_score: int = Field(default=0, ge=0, le=10, description="Technical consistency score")
    technical_depth_score: int = Field(default=0, ge=0, le=10, description="Overall score on technical depth")
    technical_knowledge_gaps: List[str] = Field(default_factory=list)
    technical_strengths: List[str] = Field(default_factory=list)

    overall_score: float = Field(default=0.0, ge=0, le=10)
    key_strengths: List[str] = Field(default_factory=list)
    critical_weaknesses: List[str] = Field(default_factory=list)

    evaluation_timestamp: Optional[str] = Field(default=None)
    candidate_id: Optional[str] = Field(default=None)
    position_evaluated_for: str = Field(default="Frontend Developer")