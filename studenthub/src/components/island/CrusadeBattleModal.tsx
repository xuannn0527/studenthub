import React, { useState, useEffect } from "react";
import type { AssignmentItem } from "../assignment";
import { getPetProfile, OUTFITS } from "../petConfig";

interface CrusadeBattleModalProps {
  assignment: AssignmentItem | null;
  onClose: () => void;
  onComplete: (assignment: AssignmentItem) => void;
}

export const CrusadeBattleModal: React.FC<CrusadeBattleModalProps> = ({
  assignment,
  onClose,
  onComplete,
}) => {
  const [phase, setPhase] = useState<"battle" | "victory">("battle");
  const [slashActive, setSlashActive] = useState(false);
  const [monsterHit, setMonsterHit] = useState(false);
  const [monsterDefeated, setMonsterDefeated] = useState(false);
  const [screenShake, setScreenShake] = useState(false);

  // 讀取當前寵物狀態與客製外觀
  const customAvatar = localStorage.getItem("hub_custom_pet_avatar");
  const currentOutfit = localStorage.getItem("hub_pet_outfit") || "default";
  const customName = localStorage.getItem("hub_custom_pet_name") || "";
  
  const savedPet = localStorage.getItem("hub_focus_pet");
  const petLevel = savedPet ? JSON.parse(savedPet).level || 1 : 1;
  const profile = getPetProfile(petLevel);
  const equippedOutfit = OUTFITS.find((o) => o.id === currentOutfit);
  const petDisplayName = customName || (customAvatar ? "守護獸伙伴" : profile.title);

  // 根據難度設定怪獸資訊
  const difficulty = assignment?.difficulty || "normal";
  const monsterInfo = {
    normal: {
      name: "怠惰小綠泥怪",
      title: "隨機出沒的微小拖延惡念",
      icon: "👾",
      hp: 100,
      color: "#10b981",
      level: 3,
    },
    elite: {
      name: "拖延夜行魔眼",
      title: "專門吞噬專注力與意志力的精銳心魔",
      icon: "👺",
      hp: 350,
      color: "#8b5cf6",
      level: 8,
    },
    boss: {
      name: "終極死線黑炎巨龍",
      title: "降臨在繳交期限前夕的毀滅級BOSS",
      icon: "🐲",
      hp: 800,
      color: "#ef4444",
      level: 15,
    },
  }[difficulty];

  const expReward = assignment?.expReward || (difficulty === "boss" ? 60 : difficulty === "elite" ? 35 : 20);
  const coinReward = assignment?.coinReward || (difficulty === "boss" ? 35 : difficulty === "elite" ? 20 : 10);

  // 戰鬥過場時間軸
  useEffect(() => {
    if (!assignment) return;
    setPhase("battle");
    setSlashActive(false);
    setMonsterHit(false);
    setMonsterDefeated(false);
    setScreenShake(false);

    // 0.4s: 守護獸發動攻擊光刃
    const t1 = setTimeout(() => {
      setSlashActive(true);
    }, 450);

    // 0.75s: 擊中怪獸，畫面劇烈震動
    const t2 = setTimeout(() => {
      setMonsterHit(true);
      setScreenShake(true);
    }, 750);

    // 1.1s: 怪獸爆炸消散
    const t3 = setTimeout(() => {
      setMonsterDefeated(true);
      setScreenShake(false);
    }, 1100);

    // 1.5s: 進入勝利結算
    const t4 = setTimeout(() => {
      setPhase("victory");
    }, 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [assignment]);

  if (!assignment) return null;

  const handleSkipToVictory = () => {
    setPhase("victory");
  };

  const handleClaim = () => {
    onComplete(assignment);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(10, 15, 30, 0.88)",
        backdropFilter: "blur(10px)",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        userSelect: "none",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* 背景動態微粒子光暈 */}
      <div
        style={{
          position: "absolute",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: phase === "battle"
            ? "radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(15, 23, 42, 0) 70%)"
            : "radial-gradient(circle, rgba(234, 179, 8, 0.25) 0%, rgba(15, 23, 42, 0) 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
          transition: "background 0.5s ease",
        }}
      />

      {/* 震動包裹容器 */}
      <div
        className={screenShake ? "shake-effect" : ""}
        style={{
          width: "90%",
          maxWidth: "680px",
          position: "relative",
          zIndex: 10,
        }}
      >
        {phase === "battle" ? (
          /* ==============================================
             ⚔️ PHASE 1: 戰鬥過場動畫遮罩
             ============================================== */
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              borderRadius: "24px",
              border: "1.5px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.2)",
              padding: "36px 32px 30px 32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* 頂部跳過與難度標籤 */}
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#94a3b8",
                }}
              >
                <span>⚔️ 討伐任務戰鬥進行中</span>
                <span style={{ color: monsterInfo.color }}>• {monsterInfo.name}</span>
              </div>

              <button
                onClick={handleSkipToVictory}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#cbd5e1",
                  borderRadius: "20px",
                  padding: "5px 14px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                title="立即跳至結算畫面"
              >
                跳過動畫 ⏭
              </button>
            </div>

            {/* 任務標題 */}
            <h2
              style={{
                color: "#ffffff",
                fontSize: "20px",
                fontWeight: "900",
                margin: "0 0 28px 0",
                textAlign: "center",
                textShadow: "0 2px 8px rgba(0,0,0,0.4)",
              }}
            >
              討伐目標：【{assignment.category || "作業"}】{assignment.title}
            </h2>

            {/* 對決舞台：左側守護獸 VS 右側任務怪獸 */}
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
                position: "relative",
                minHeight: "180px",
                marginBottom: "24px",
              }}
            >
              {/* 👈 我方守護獸 */}
              <div
                className={slashActive ? "pet-attack-leap" : "pet-ready"}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  transition: "transform 0.3s ease",
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    width: "88px",
                    height: "88px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.12)",
                    border: `3px solid ${profile.color}`,
                    boxShadow: `0 0 25px ${profile.color}60`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {customAvatar ? (
                    <img
                      src={customAvatar}
                      alt="pet"
                      style={{ width: "85%", height: "85%", objectFit: "contain" }}
                    />
                  ) : (
                    <span style={{ fontSize: "50px", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}>
                      {profile.icon}
                    </span>
                  )}

                  {currentOutfit !== "default" && equippedOutfit && !customAvatar && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-4px",
                        right: "4px",
                        fontSize: "24px",
                      }}
                    >
                      {equippedOutfit.icon}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    color: "#f8fafc",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: "800",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                  }}
                >
                  {petDisplayName} (Lv.{petLevel})
                </div>
              </div>

              {/* ⚡ 能量光刃 Slash 特效 */}
              {slashActive && (
                <div
                  className="slash-beam-anim"
                  style={{
                    position: "absolute",
                    left: "40%",
                    top: "30%",
                    width: "160px",
                    height: "8px",
                    background: "linear-gradient(90deg, #38bdf8, #818cf8, #ffffff)",
                    borderRadius: "99px",
                    boxShadow: "0 0 20px #38bdf8, 0 0 40px #818cf8",
                    transform: "rotate(-25deg)",
                    zIndex: 5,
                  }}
                />
              )}

              {/* 💥 暴擊傷害字體 */}
              {monsterHit && (
                <div
                  className="crit-damage-anim"
                  style={{
                    position: "absolute",
                    right: "22%",
                    top: "10%",
                    color: "#fbbf24",
                    fontSize: "24px",
                    fontWeight: "900",
                    fontStyle: "italic",
                    textShadow: "0 0 10px #f59e0b, 0 0 20px #ef4444",
                    zIndex: 10,
                  }}
                >
                  CRITICAL HIT!
                  <div style={{ fontSize: "16px", color: "#f87171", textAlign: "center" }}>-9999 DMG</div>
                </div>
              )}

              {/* 👉 敵方作業怪獸 */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.3s ease",
                  opacity: monsterDefeated ? 0 : 1,
                  transform: monsterDefeated
                    ? "scale(0.3) rotate(30deg)"
                    : monsterHit
                    ? "translateX(16px) scale(0.95)"
                    : "scale(1)",
                  filter: monsterHit ? "brightness(2) contrast(1.5)" : "none",
                }}
              >
                <div
                  style={{
                    width: "96px",
                    height: "96px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    border: `3px solid ${monsterInfo.color}`,
                    boxShadow: `0 0 25px ${monsterInfo.color}50`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "54px", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))" }}>
                    {monsterInfo.icon}
                  </span>
                </div>

                {/* 怪獸血條與名稱 */}
                <div style={{ width: "110px", textAlign: "center" }}>
                  <div style={{ color: "#f1f5f9", fontSize: "12px", fontWeight: "800", marginBottom: "3px" }}>
                    {monsterInfo.name}
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "6px",
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                      borderRadius: "99px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: monsterHit ? "0%" : "100%",
                        height: "100%",
                        backgroundColor: monsterInfo.color,
                        transition: "width 0.25s ease-out",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 底部狀態說明 */}
            <div
              style={{
                fontSize: "13px",
                color: "#94a3b8",
                fontWeight: "600",
                letterSpacing: "0.5px",
              }}
            >
              {monsterDefeated ? "✨ 任務怪獸已擊破！結算中..." : "⚔️ 守護獸正在全力破除作業障礙..."}
            </div>
          </div>
        ) : (
          /* ==============================================
             🏆 PHASE 2: 勝利與獎勵結算視窗
             ============================================== */
          <div
            className="victory-pop-anim"
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.98)",
              borderRadius: "28px",
              border: "2px solid rgba(251, 191, 36, 0.4)",
              boxShadow: "0 25px 70px rgba(0, 0, 0, 0.7), 0 0 50px rgba(234, 179, 8, 0.25)",
              padding: "40px 36px 36px 36px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* 關閉按鈕 */}
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#94a3b8",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="關閉視窗"
            >
              ✕
            </button>

            {/* 勝利皇冠與稱號 */}
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f59e0b, #eab308)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
                boxShadow: "0 0 30px rgba(245, 158, 11, 0.6)",
                marginBottom: "16px",
              }}
            >
              👑
            </div>

            <div
              style={{
                color: "#fbbf24",
                fontSize: "13px",
                fontWeight: "900",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              QUEST CLEARED!
            </div>

            <h1
              style={{
                color: "#ffffff",
                fontSize: "26px",
                fontWeight: "900",
                margin: "0 0 10px 0",
                letterSpacing: "-0.5px",
              }}
            >
              🎉 討伐大成功！
            </h1>

            {/* 完成事項名稱 */}
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "14px",
                padding: "10px 18px",
                color: "#e2e8f0",
                fontSize: "15px",
                fontWeight: "700",
                maxWidth: "85%",
                marginBottom: "26px",
                lineHeight: "1.4",
              }}
            >
              【{assignment.category || "作業"}】{assignment.title}
            </div>

            {/* 獎勵卡片雙欄 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                width: "100%",
                maxWidth: "420px",
                marginBottom: "26px",
              }}
            >
              {/* 經驗獎勵卡 */}
              <div
                style={{
                  backgroundColor: "rgba(59, 130, 246, 0.12)",
                  border: "1.5px solid rgba(59, 130, 246, 0.35)",
                  borderRadius: "16px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span style={{ fontSize: "28px" }}>✨</span>
                <span style={{ fontSize: "11px", color: "#93c5fd", fontWeight: "700" }}>守護獸經驗值</span>
                <span style={{ fontSize: "22px", fontWeight: "900", color: "#60a5fa" }}>+{expReward} EXP</span>
              </div>

              {/* 金幣獎勵卡 */}
              <div
                style={{
                  backgroundColor: "rgba(245, 158, 11, 0.12)",
                  border: "1.5px solid rgba(245, 158, 11, 0.35)",
                  borderRadius: "16px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span style={{ fontSize: "28px" }}>🪙</span>
                <span style={{ fontSize: "11px", color: "#fcd34d", fontWeight: "700" }}>冒險金幣</span>
                <span style={{ fontSize: "22px", fontWeight: "900", color: "#fbbf24" }}>+{coinReward} 幣</span>
              </div>
            </div>

            {/* 守護獸激勵語錄 */}
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: "12px",
                padding: "8px 16px",
                fontSize: "12px",
                color: "#cbd5e1",
                fontWeight: "600",
                marginBottom: "28px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>{profile.icon}</span>
              <span>{petDisplayName}：「太強大了！又擊退了一隻死線心魔，我們距離升級更近了！🐾」</span>
            </div>

            {/* 確認按鈕 */}
            <button
              onClick={handleClaim}
              style={{
                width: "100%",
                maxWidth: "340px",
                padding: "14px 28px",
                borderRadius: "14px",
                border: "none",
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: "800",
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(16, 185, 129, 0.4)",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <span>收下獎勵並歸檔任務</span>
              <span style={{ fontSize: "18px" }}>➔</span>
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes screenShake {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-6px, 4px); }
          40% { transform: translate(6px, -4px); }
          60% { transform: translate(-4px, 2px); }
          80% { transform: translate(4px, -2px); }
        }
        .shake-effect {
          animation: screenShake 0.35s ease-in-out;
        }

        @keyframes petLeap {
          0% { transform: translateX(0) scale(1); }
          50% { transform: translateX(90px) scale(1.15) rotate(10deg); }
          100% { transform: translateX(30px) scale(1); }
        }
        .pet-attack-leap {
          animation: petLeap 0.45s ease-out forwards;
        }

        .pet-ready {
          animation: petBounce 1.5s infinite ease-in-out;
        }
        @keyframes petBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        @keyframes slashBeam {
          0% { transform: rotate(-25deg) scaleX(0); opacity: 0; }
          40% { transform: rotate(-25deg) scaleX(1.4); opacity: 1; }
          100% { transform: rotate(-25deg) scaleX(2) translateX(40px); opacity: 0; }
        }
        .slash-beam-anim {
          animation: slashBeam 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        @keyframes critFloat {
          0% { transform: scale(0.4) translateY(20px); opacity: 0; }
          40% { transform: scale(1.2) translateY(-10px); opacity: 1; }
          100% { transform: scale(1) translateY(-25px); opacity: 0.9; }
        }
        .crit-damage-anim {
          animation: critFloat 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes victoryPop {
          0% { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .victory-pop-anim {
          animation: victoryPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default CrusadeBattleModal;
