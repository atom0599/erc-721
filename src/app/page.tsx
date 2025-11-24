'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// window.ethereum 타입 선언
declare global {
  interface Window {
    ethereum?: any;
  }
}

// ===== 필수 정보 =====
const STUDENT_ID = '92113798';
const STUDENT_NAME = '이현';
const OWNER_ADDRESS = '0x9a473cb6931e208c881d61829000bd0f8437fd5c';
const CONTRACT_ADDRESS = '0x0aEEBd8823Bde75228799BFDe6d9Ee1024b9B960';

// ===== ABI =====
const ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function safeTransferFrom(address from, address to, uint256 tokenId)',
];

export default function Home() {
  const [account, setAccount] = useState('');
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [to, setTo] = useState('');
  const [tokenId, setTokenId] = useState('');

  // 지갑 연결
  const connectWallet = async () => {
    if (!window.ethereum) return alert('MetaMask를 설치해주세요!');
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      setAccount(accounts[0]);
      // 연결 후 자동으로 NFT 목록 로드
    } catch (e) {
      console.error(e);
    }
  };

  // 계정이 설정되면 NFT 로드 시작
  useEffect(() => {
    if (account) {
      loadMyNFTs();
    }
  }, [account]);

  // 내 NFT 목록 불러오기
  const loadMyNFTs = async () => {
    if (!account || !window.ethereum) return;
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      const balance = await contract.balanceOf(account);
      const list = [];

      for (let i = 0; i < balance; i++) {
        const id = await contract.tokenOfOwnerByIndex(account, i);
        let uri = await contract.tokenURI(id);
        
        // IPFS 주소 변환
        if (uri.startsWith('ipfs://')) {
          uri = uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
        }

        let image = 'https://via.placeholder.com/300?text=NFT+' + id;
        
        // 메타데이터에서 이미지 URL 추출
        try {
          const response = await fetch(uri);
          const meta = await response.json();
          if (meta.image) {
            image = meta.image.startsWith('ipfs://')
              ? meta.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
              : meta.image;
          }
        } catch (e) {
          console.warn(`Failed to load metadata for token ${id}`, e);
        }
        list.push({ id: id.toString(), uri, image });
      }
      setNfts(list);
    } catch (e) {
      console.error(e);
      alert('NFT 목록을 불러오는 중 오류가 발생했습니다.');
    }
    setLoading(false);
  };

  // NFT 전송
  const transferNFT = async () => {
    if (!to || !tokenId) return alert('주소와 Token ID를 모두 입력해주세요.');
    if (!window.ethereum) return alert('MetaMask가 필요합니다.');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      
      alert('트랜잭션 승인을 기다리는 중...');
      const tx = await contract.safeTransferFrom(account, to, tokenId);
      
      alert('트랜잭션이 전송되었습니다. 블록체인 확인 대기 중...');
      await tx.wait();
      
      alert(`NFT #${tokenId} 전송 성공!`);
      setTo('');
      setTokenId('');
      loadMyNFTs(); // 목록 갱신
    } catch (e: any) {
      console.error(e);
      // 사용자가 거부한 경우와 실제 오류 구분
      if (e.code === 'ACTION_REJECTED') {
        alert('트랜잭션이 거부되었습니다.');
      } else {
        alert('전송 실패: ' + (e.message || '알 수 없는 오류'));
      }
    }
  };

  return (
    // 배경 변경: 화려한 그라데이션 -> 차분한 다크 슬레이트 배경
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        
        {/* 헤더: 교수님 필수 확인 항목 */}
        <div className="text-center mb-12 space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-tight">중부대학교 정보보호학과</h1>
          <h2 className="text-2xl text-slate-300 font-light">{STUDENT_ID} {STUDENT_NAME}</h2>
        </div>

        {/* 컨트랙트 정보 카드: 반투명 -> 불투명한 다크 카드 */}
        <div className="bg-slate-800 rounded-2xl p-8 mb-8 shadow-xl border border-slate-700">
          <h3 className="text-xl font-bold mb-4 text-white">ERC-721 컨트랙트 정보</h3>
          <div className="space-y-3 font-mono text-sm text-slate-400">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-1 font-sans">Contract Address</p>
              <p className="break-all bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">{CONTRACT_ADDRESS}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-1 font-sans">Owner Address</p>
              <p className="break-all bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">{OWNER_ADDRESS}</p>
            </div>
          </div>
        </div>

        {/* 지갑 연결 전/후 화면 */}
        {!account ? (
          <div className="text-center py-8">
            <button
              onClick={connectWallet}
              // 버튼 변경: 그라데이션 -> 차분한 틸(Teal) 단색 버튼
              className="bg-teal-600 hover:bg-teal-700 text-white text-lg font-bold py-4 px-10 rounded-xl shadow-lg transition-colors"
            >
              MetaMask 지갑 연결
            </button>
            <p className="mt-4 text-slate-400 text-sm">NFT를 확인하고 전송하려면 지갑을 연결하세요.</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* 내 지갑 주소 */}
            <div className="text-center bg-slate-800/50 py-3 px-6 rounded-full inline-block mx-auto border border-slate-700">
              <p className="text-sm text-slate-400">
                Connected: <span className="font-mono text-teal-400 font-medium">{account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
              </p>
            </div>

            {/* NFT 목록 영역 */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">내 NFT 보유 목록</h3>
                <button onClick={loadMyNFTs} disabled={loading} className="text-sm text-teal-400 hover:text-teal-300 disabled:text-slate-600">
                  {loading ? '새로고침 중...' : '🔄 목록 새로고침'}
                </button>
              </div>

              {loading ? (
                <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                  <p className="text-xl text-slate-300 animate-pulse">블록체인에서 NFT 정보를 불러오는 중...</p>
                </div>
              ) : nfts.length === 0 ? (
                <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                  <p className="text-xl text-slate-400">보유한 NFT가 없습니다.</p>
                </div>
              ) : (
                // NFT 그리드: 카드 스타일 변경
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nfts.map((nft) => (
                    <div key={nft.id} className="bg-slate-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-slate-700 group">
                      <div className="aspect-square overflow-hidden bg-slate-900 relative">
                        <img
                          src={nft.image}
                          alt={`NFT #${nft.id}`}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Image+Error';
                          }}
                        />
                        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full border border-slate-700">
                          <p className="text-xs font-bold text-teal-400">ERC-721</p>
                        </div>
                      </div>
                      <div className="p-5">
                        <p className="text-lg font-bold text-white mb-1">Token ID <span className="text-teal-400">#{nft.id}</span></p>
                        <p className="text-xs text-slate-500 truncate">{nft.uri}</p>
                        <button 
                          onClick={() => setTokenId(nft.id)}
                          className="mt-4 w-full py-2 bg-slate-700 hover:bg-slate-600 text-sm text-slate-200 rounded-lg transition-colors"
                        >
                          전송하기에 ID 입력
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* NFT 전송 폼: 스타일 변경 */}
            <div className="bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-700">
              <h3 className="text-2xl font-bold mb-6 text-white">NFT 전송하기</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">받는 사람 주소 (0x...)</label>
                  <input
                    placeholder="예: 0x1234..."
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    // 입력창 변경: 흰색 -> 어두운 배경
                    className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">보낼 Token ID</label>
                  <input
                    placeholder="예: 1"
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                    // 입력창 변경: 흰색 -> 어두운 배경
                    className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
                <button
                  onClick={transferNFT}
                  // 버튼 변경: 그라데이션 -> 차분한 인디고 단색 버튼
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg py-4 rounded-xl shadow-md transition-colors mt-2"
                >
                  NFT 전송 시작
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}