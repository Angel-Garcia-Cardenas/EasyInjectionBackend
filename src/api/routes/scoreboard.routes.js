const express = require("express");
const auth = require("../middleware/auth.middleware");
const { User } = require("../../models/user/user.model");
const { Scan } = require("../../models/scan/scan.model");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const { timeframe = "all", limit = 100 } = req.query;

    let dataFilter = {};

    if (timeframe === "week") {
      const weekAgo = new Date();

      weekAgo.setDate(weekAgo.getDate() - 7);
      dataFilter = { fecha_fin: { $gte: weekAgo } };
    } else if (timeframe === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dataFilter = { fecha_fin: { $gte: monthAgo } };
    }

    const userScores = await Scan.aggregate([
      {
        $match: {
          estado: "finalizado",
          ...dataFilter,
        },
      },
      {
        $group: {
          _id: "$usuario_id",
          totalPoints: { $sum: "$puntuacion.puntuacion_final" },
          totalScans: { $sum: 1 },
          totalVulnerabilities: {
            $sum: "$puntuacion.vulnerabilidades_encontradas",
          },
          avgScore: { $avg: "$puntuacion.puntuacion_final" },
          bestScore: { $max: "$puntuacion.puntuacion_final" },
        },
      },
      { $sort: { totalPoints: -1 } },
      { $limit: parseInt(limit) },
    ]);

    const scoreboard = await Promise.all(
      userScores.map(async (score, index) => {
        const user = await User.findById(score._id).select(
          "username perfil.avatarId perfil.nivel_actual"
        );

        return {
          rank: index + 1,
          userId: score._id,
          username: user?.username || "Unknown",
          avatarId: user?.perfil?.avatarId || "avatar1",
          level: user?.perfil?.nivel_actual || 1,
          totalPoints: Math.round(score.totalPoints),
          totalScans: score.totalScans,
          totalVulnerabilities: score.totalVulnerabilities,
          avgScore: Math.round(score.avgScore),
          bestScore: Math.round(score.bestScore),
        };
      })
    );

    const currentUserRank =
      scoreboard.findIndex(
        (s) => s.userId.toString() === req.user._id.toString()
      ) + 1;

    res.json({
      success: true,
      scoreboard,
      currentUserRank: currentUserRank || null,
      timeframe,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const scans = await Scan.find({
      usuario_id: req.user._id,
      estado: "finalizado",
    });

    const totalPoints = scans.reduce(
      (sum, scan) => sum + (scan.puntuacion?.puntuacion_final || 0),
      0
    );
    const totalVulnerabilities = scans.reduce(
      (sum, scan) => sum + (scan.puntuacion?.vulnerabilidades_encontradas || 0),
      0
    );
    const avgScore = scans.length > 0 ? totalPoints / scans.length : 0;
    const bestScan = scans.sort(
      (a, b) =>
        (b.puntuacion?.puntuacion_final || 0) -
        (a.puntuacion?.puntuacion_final || 0)
    )[0];

    const level = Math.floor(totalPoints / 1000) + 1;

    const user = await User.findById(req.user._id);
    if (user && user.perfil) {
      user.perfil.nivel_actual = level;
      await user.save();
    }

    res.json({
      success: true,
      stats: {
        totalPoints: Math.round(totalPoints),
        totalScans: scans.length,
        totalVulnerabilities,
        avgScore: Math.round(avgScore),
        bestScore: bestScan
          ? Math.round(bestScan.puntuacion?.puntuacion_final || 0)
          : 0,
        bestScanAlias: bestScan?.alias || "N/A",
        level,
      },
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
});

module.exports = router;
