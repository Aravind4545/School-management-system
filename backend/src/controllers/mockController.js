import * as mockService from '../services/mockService.js';

export const getAccess = async (req, res, next) => {
  try {
    const data = await mockService.checkMockAccess(req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const startMock = async (req, res, next) => {
  try {
    const data = await mockService.startMock(req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getAttempt = async (req, res, next) => {
  try {
    const data = await mockService.getMockAttemptDetails(req.params.attemptId, req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const saveAnswer = async (req, res, next) => {
  try {
    const data = await mockService.saveMockAnswer(
      req.params.attemptId,
      req.user.id,
      req.body.questionId,
      req.body.selectedOption
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const recordViolation = async (req, res, next) => {
  try {
    const violations = await mockService.recordMockViolation(req.params.attemptId, req.user.id);
    if (violations >= 3) {
      const result = await mockService.submitMock(req.params.attemptId, req.user.id, req.body.timeSpentSec || 0, true);
      return res.json({ violations, autoSubmitted: true, result });
    }
    res.json({ violations, autoSubmitted: false });
  } catch (err) {
    next(err);
  }
};

export const submitMock = async (req, res, next) => {
  try {
    const result = await mockService.submitMock(
      req.params.attemptId,
      req.user.id,
      req.body.timeSpentSec || 0,
      req.body.autoSubmit || false
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getResult = async (req, res, next) => {
  try {
    const result = await mockService.getMockResult(req.params.attemptId, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
