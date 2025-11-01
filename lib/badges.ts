import { createClient } from "@/lib/supabase/server";

/**
 * 사용자의 배지 획득 조건을 확인하고 자동으로 배지를 부여합니다.
 */
export async function checkAndAwardBadges(userId: string) {
  const supabase = await createClient();

  try {
    // 모든 배지 조회
    const { data: badges } = await supabase.from("badges").select("*");

    if (!badges) return;

    // 이미 획득한 배지 조회
    const { data: userBadges } = await supabase
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", userId);

    const earnedBadgeIds = new Set(userBadges?.map((ub: any) => ub.badge_id) || []);

    // 사용자 통계 조회
    const { data: reviews } = await (supabase as any)
      .from("reviews")
      .select(
        `
        id,
        rating,
        bakery:bakeries (
          id
        )
      `
      )
      .eq("user_id", userId);

    const reviewCount = reviews?.length || 0;
    const visitedBakeries = new Set(
      reviews?.map((r: any) => r.bakery?.id).filter((id: any) => id)
    );
    const visitedBakeriesCount = visitedBakeries.size;
    const perfectRatingCount =
      reviews?.filter((r: any) => r.rating === 5).length || 0;

    // 테마별 방문 수 계산
    const bakeryIds = Array.from(visitedBakeries);
    let themeCounts: Record<string, number> = {};

    if (bakeryIds.length > 0) {
      const { data: bakeryThemes } = await (supabase as any)
        .from("bakery_themes")
        .select(
          `
          bakery_id,
          theme:themes (
            id,
            name
          )
        `
        )
        .in("bakery_id", bakeryIds);

      bakeryThemes?.forEach((bt: any) => {
        if (bt.theme) {
          const themeName = bt.theme.name;
          themeCounts[themeName] = (themeCounts[themeName] || 0) + 1;
        }
      });
    }

    // 각 배지의 조건 확인
    const badgesToAward: string[] = [];

    for (const badge of (badges || [])) {
      // 이미 획득한 배지는 건너뛰기
      if (earnedBadgeIds.has((badge as any).id)) continue;

      let shouldAward = false;
      const badgeAny = badge as any;

      switch (badgeAny.condition_type) {
        case "review_count":
          if (reviewCount >= (badgeAny.condition_value || 0)) {
            shouldAward = true;
          }
          break;

        case "bakery_count":
          if (visitedBakeriesCount >= (badgeAny.condition_value || 0)) {
            shouldAward = true;
          }
          break;

        case "perfect_rating":
          if (perfectRatingCount >= (badgeAny.condition_value || 0)) {
            shouldAward = true;
          }
          break;

        case "theme_visit_croissant":
          if ((themeCounts["크루아상"] || 0) >= (badgeAny.condition_value || 0)) {
            shouldAward = true;
          }
          break;

        // 추가 테마 조건들을 여기에 추가 가능
        default:
          break;
      }

      if (shouldAward) {
        badgesToAward.push(badgeAny.id);
      }
    }

    // 배지 부여
    if (badgesToAward.length > 0) {
      const { error } = await (supabase as any).from("user_badges").insert(
        badgesToAward.map((badgeId) => ({
          user_id: userId,
          badge_id: badgeId,
        }))
      );

      if (error) {
        console.error("배지 부여 오류:", error);
      } else {
        console.log(`${badgesToAward.length}개의 새로운 배지가 부여되었습니다.`);
      }
    }

    return badgesToAward;
  } catch (error) {
    console.error("배지 확인 오류:", error);
    return [];
  }
}
