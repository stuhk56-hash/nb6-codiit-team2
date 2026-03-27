export default function SellerPrivacyPage() {
  return (
    <div className="mx-auto max-w-[980px] px-6 py-10">
      <h1 className="text-3xl font-extrabold">개인정보 수집·이용 안내</h1>
      <p className="mt-3 text-sm text-gray-500">시행일: 2026-03-26</p>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-bold">1. 수집 항목</h2>
        <ul className="list-disc space-y-1 pl-5 text-gray-800">
          <li>대표자명</li>
          <li>사업자등록번호</li>
          <li>통신판매업 신고번호</li>
          <li>사업자 연락처</li>
          <li>사업장 소재지</li>
        </ul>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-bold">2. 수집·이용 목적</h2>
        <p className="text-gray-800">
          판매자 식별, 거래 안정성 확보, 법령상 고지 의무 이행, 고객 문의 대응을 위해 수집·이용합니다.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-bold">3. 보유 및 이용 기간</h2>
        <p className="text-gray-800">
          관련 법령 및 내부 정책에 따라 일정 기간 보관 후 파기합니다.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-bold">4. 공개 항목 안내</h2>
        <p className="text-gray-800">
          입력된 정보 중 일부는 상품 상세 화면의 판매자정보/배송·교환·반품 안내 영역에 구매자에게 공개될 수 있습니다.
        </p>
      </section>
    </div>
  );
}
