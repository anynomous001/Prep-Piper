"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.demoInterviewData = void 0;
exports.demoInterviewData = {
    tech_stack: "React, JavaScript, TypeScript, CSS, HTML, Next.js",
    position: "Frontend Developer",
    question_count: 5,
    difficulty: "intermediate",
    conversation_history: [
        {
            role: "interviewer",
            content: "Hello! I'm Prep Piper, your AI interviewer for today's Frontend Developer interview. I see your tech stack includes: React, JavaScript, TypeScript, CSS, HTML, Next.js. Let's start with something fundamental. Can you explain what React hooks are and describe a project where you've used useState and useEffect effectively?"
        },
        {
            role: "candidate",
            content: "React hooks are functions that let you use state and lifecycle features in functional components. useState manages component state, while useEffect handles side effects like API calls. In my e-commerce project, I used useState to manage cart items and product filters. I used useEffect to fetch product data when the component mounted and to update the URL parameters when filters changed. For example, useEffect(() => { fetchProducts(filters); }, [filters]) would refetch products whenever filters updated."
        },
        {
            role: "interviewer",
            content: "That's a solid example! Now, let's dive deeper into performance. You mentioned fetching products when filters change. How would you optimize this if the API calls were expensive and users were typing quickly in a search filter? What React patterns or techniques would you use?"
        },
        {
            role: "candidate",
            content: "I'd implement debouncing to avoid excessive API calls. I could create a custom hook useDebounce that delays the API call until the user stops typing for a certain period, like 300ms. I'd also use useMemo to memoize expensive calculations and React.memo to prevent unnecessary re-renders of child components. For the search results, I might implement virtual scrolling if there are many items. Additionally, I'd add loading states and error handling to improve user experience during API calls."
        },
        {
            role: "interviewer",
            content: "Excellent performance considerations! Let's talk about TypeScript integration. You have TypeScript in your tech stack. How do you handle type safety when working with API responses in a React application? Can you walk me through typing a component that displays user data from an API?"
        },
        {
            role: "candidate",
            content: "I start by defining interfaces for the API response structure. For example: interface User { id: string; name: string; email: string; avatar?: string; }. Then I create a typed custom hook like useUser that returns { user: User | null, loading: boolean, error: string | null }. In the component, I use these types: const UserProfile: React.FC<{ userId: string }> = ({ userId }) => { const { user, loading, error } = useUser(userId); }. I also use type guards or libraries like Zod to validate API responses at runtime, ensuring the data matches our expected types."
        },
        {
            role: "interviewer",
            content: "Great approach to type safety! Now let's discuss CSS and styling. How do you approach responsive design in modern React applications? What's your preferred method for handling different screen sizes and why?"
        },
        {
            role: "candidate",
            content: "I prefer a mobile-first approach using CSS-in-JS libraries like styled-components or CSS modules with Tailwind CSS. I define breakpoints as constants and use them consistently. For complex layouts, I use CSS Grid and Flexbox. I also implement container queries for component-level responsiveness. For example, a Card component might have different layouts based on its container size, not just viewport size. I test responsiveness using Chrome DevTools and real devices, ensuring touch targets are at least 44px for accessibility."
        },
        {
            role: "interviewer",
            content: "Perfect! Final question - let's talk about Next.js since it's in your stack. You're building an e-commerce product page that needs to be SEO-friendly and fast. How would you structure this page using Next.js features, and what rendering strategy would you choose?"
        },
        {
            role: "candidate",
            content: "I'd use Static Site Generation (SSG) with getStaticPaths and getStaticProps for product pages since they're relatively static and SEO is crucial. I'd implement Incremental Static Regeneration (ISR) to update product data periodically without rebuilding the entire site. For dynamic content like reviews or inventory status, I'd use client-side fetching with SWR. I'd optimize images using Next.js Image component with proper sizing and lazy loading. For SEO, I'd use next/head for meta tags and implement structured data for rich snippets. The file structure would be pages/products/[slug].tsx for dynamic routing."
        },
        {
            role: "interviewer",
            content: "🏁 **Interview Complete!** Thank you for participating in this Frontend Developer interview! 📊 **Session Summary:** - Questions Answered: 5/5 - Tech Stack Covered: React, JavaScript, TypeScript, CSS, HTML, Next.js - Performance optimizations, TypeScript integration, responsive design, and Next.js SSG discussed - Final Assessment: Strong intermediate-level frontend developer with good understanding of modern React ecosystem"
        }
    ]
};
//# sourceMappingURL=data.js.map