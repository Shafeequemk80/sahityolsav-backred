const { Router } = require("express");
const Teams = require("../models/addTeam");
const mongoose = require("mongoose");
const TeamPoint = require("../models/teamPointModel");

const addTeam = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { teamName } = req.body;
    console.log(teamName);
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

    res.status(201).json({ message: "Team Name added Succuessfuly" });
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
    res
      .status(200)
      .json({ data: getTeam, message: "Team Name fetch Succuessfuly" });
  } else {
    res.status(400).json({ message: "get team feild" });
  }
};

module.exports = {
  addTeam,
  getTeam,
};
