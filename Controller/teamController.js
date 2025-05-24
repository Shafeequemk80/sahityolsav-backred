const { Router } = require("express");
const Teams = require("../models/Team");
const mongoose = require("mongoose");
const TeamPoint = require("../models/teamPointModel");
const { findOne } = require("../models/Brochure");

const addTeam = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { teamName } = req.body;
    session.startTransaction();
    const teamData = await Teams.findOne({ teamName }).session(session);

    if (teamData) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "team already added" });
    }
    const [newTeam] = await Teams.create([{ teamName }], { session });

    const newTeamPoint = await TeamPoint.findOne().session(session);
    if (newTeamPoint) {
      newTeamPoint.results.push({ team: newTeam._id, point: 0 });
      await newTeamPoint.save({ session });
    } else {
      await TeamPoint.create([{ results: [{ team: newTeam._id, point: 0 }] }], {
        session,
      });
    }
    await session.commitTransaction();
    session.endSession();

    res
      .status(201)
      .json({ data: newTeam, message: "Team Name added Succuessfuly" });
  } catch (error) {
    console.log(error.message);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "server error" });
  }
};

const getTeam = async (req, res) => {
  const getTeam = await Teams.find();
  if (getTeam) {
    res.status(200).json({
      data: getTeam.reverse(),
      message: "Team Name fetch Succuessfuly",
    });
  } else {
    res.status(400).json({ message: "get team feild" });
  }
};

const deleteTeam = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { teamId } = req.params;
    session.startTransaction();
    const isTeamAvailable = await Teams.findById(teamId).session(session);
    if (isTeamAvailable) {
      await TeamPoint.findOneAndUpdate(
        {
          "results.team": teamId,
        },
        { $pull: { results: { team: teamId } } }
      ).session(session);

      await Teams.findByIdAndDelete(teamId).session(session);
      await session.commitTransaction();
      session.endSession();
      return res
        .status(200)
        .json({ success: true, message: "Team Deleted Successfully" });
    } else {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Team Not available" });
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error.message);

    res.status(500).json({ message: "server error" });
  }
};

const editTeam = async (req, res) => {
  try {
    const { teamId, teamName } = req.body;

    const existingTeam = await Teams.findOne({ teamName });
    if (existingTeam && existingTeam._id.toString() !== teamId) {
      return res
        .status(400)
        .json({ success: false, message: "Team name already exists" });
    }

    const savedTeam = await Teams.findByIdAndUpdate(
      teamId,
      { teamName },
      { new: true }
    );
    if (!savedTeam) {
      return res
        .status(404)
        .json({ success: false, message: "Team Not Found" });
    } else {
      return res
        .status(200)
        .json({ data: savedTeam, message: "Team name updated successfully" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
module.exports = {
  addTeam,
  getTeam,
  deleteTeam,
  editTeam,
};
