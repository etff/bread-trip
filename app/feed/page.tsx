export default function FeedPage() {
  return (
    <div className="min-h-screen bg-warm">
      <div className="max-w-screen-md mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-brown">피드</h1>
          <p className="text-gray-600 text-sm mt-1">
            다른 빵지러들의 탐험을 둘러보세요
          </p>
        </div>

        {/* 필터 탭 */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {["전체", "성수", "망원", "홍대", "이태원", "강남"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                tab === "전체"
                  ? "bg-brown text-white"
                  : "bg-white text-gray-600 hover:bg-cream"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 피드 리스트 */}
        <div className="space-y-4">
          {/* 빈 상태 */}
          <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
            <div className="text-6xl mb-4">🍞</div>
            <h2 className="text-xl font-bold mb-2">아직 리뷰가 없습니다</h2>
            <p className="text-gray-600">
              첫 번째로 빵집을 탐험하고 리뷰를 남겨보세요!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
