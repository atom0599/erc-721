import React from 'react';

// --- Helper Component for Displaying Key Information ---
const InfoCard = ({ title, value, icon, isAddress = false }) => (
  <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl transition-all duration-300 border border-zinc-200 dark:border-zinc-700">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-xl text-indigo-500 dark:text-indigo-400">{icon}</span>
      <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
        {title}
      </h3>
    </div>
    {isAddress ? (
      <p className="text-base break-all font-mono text-black dark:text-white mt-1 leading-snug p-2 bg-white dark:bg-zinc-900 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700">
        {value}
      </p>
    ) : (
      <p className="text-xl font-bold text-black dark:text-white mt-1">
        {value}
      </p>
    )}
  </div>
);

// Main application component
export default function App() {
  // --- 사용자 정보 및 블록체인 주소 (이곳을 수정하세요) ---
  const studentId = "92113798"; // 학번을 입력하세요
  const studentName = "이현"; // 이름을 입력하세요
  const contractAddress = "0x0aEEBd8823Bde75228799BFDe6d9Ee1024b9B960"; // 배포된 컨트랙트 주소를 입력하세요
  const ownerAddress = "0x9a473cb6931e208c881d61829000bd0f8437fd5c";       // 소유자 주소를 입력하세요

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4 sm:p-8">
      <main className="w-full max-w-4xl flex flex-col items-center justify-between p-8 sm:p-12 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl space-y-10">
        
        {/* Header/Title Area */}
        <div className="text-center w-full space-y-2">
          {/* Next.js 로고 대신 타이틀 삽입 */}
          <h1 className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">
            Decentralized App Information
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            학번, 이름 및 배포된 블록체인 주소 정보
          </p>
        </div>

        {/* Info Grid Section (Responsive Layout) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Student Info */}
          <InfoCard 
            title="Student ID (학번)" 
            value={studentId} 
            icon="🆔" 
          />
          <InfoCard 
            title="Name (이름)" 
            value={studentName} 
            icon="👤" 
          />
          
          {/* Blockchain Addresses */}
          <div className="md:col-span-2 space-y-6">
            <InfoCard 
              title="Deployed Contract Address" 
              value={contractAddress} 
              icon="📜"
              isAddress={true}
            />
            <InfoCard 
              title="Contract Owner Address" 
              value={ownerAddress} 
              icon="👑"
              isAddress={true}
            />
          </div>
        </div>

        {/* Documentation Links (Original structure preserved) */}
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row w-full justify-center pt-8 border-t border-zinc-100 dark:border-zinc-800">
          <a
            className="flex h-12 w-full items-center justify-center rounded-full bg-indigo-600 px-5 text-white transition-colors hover:bg-indigo-700 md:w-[200px]"
            href="https://vercel.com/new"
            target="_blank"
            rel="noopener noreferrer"
          >
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-zinc-300 dark:border-white/[.145] px-5 transition-colors hover:bg-zinc-100 dark:hover:bg-[#1a1a1a] md:w-[200px]"
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
        
      </main>
    </div>
  );
}