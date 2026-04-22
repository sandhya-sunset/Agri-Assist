jest.mock('../models/Task', () => ({
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneAndDelete: jest.fn()
}));

jest.mock('../models/Notification', () => ({
  create: jest.fn()
}));

const Task = require('../models/Task');
const Notification = require('../models/Notification');
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  testReminder
} = require('./taskController');

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
}

describe('taskController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createTask returns 201 with created task', async () => {
    const task = { _id: 't1', title: 'Water plants' };
    Task.create.mockResolvedValue(task);

    const req = {
      user: { _id: 'u1' },
      body: { title: 'Water plants', scheduledDate: '2026-04-22', scheduledTime: '8:00 AM' }
    };
    const res = createRes();

    await createTask(req, res);

    expect(Task.create).toHaveBeenCalledWith({
      user: 'u1',
      title: 'Water plants',
      scheduledDate: '2026-04-22',
      scheduledTime: '8:00 AM'
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('getTasks returns sorted tasks', async () => {
    const tasks = [{ _id: 't1' }];
    Task.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue(tasks)
    });

    const req = { user: { _id: 'u1' } };
    const res = createRes();

    await getTasks(req, res);

    expect(Task.find).toHaveBeenCalledWith({ user: 'u1' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: tasks });
  });

  test('updateTask returns 404 when task does not exist', async () => {
    Task.findOne.mockResolvedValue(null);

    const req = {
      user: { _id: 'u1' },
      params: { id: 't404' },
      body: { isCompleted: true }
    };
    const res = createRes();

    await updateTask(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Task not found' });
  });

  test('deleteTask returns success when task deleted', async () => {
    Task.findOneAndDelete.mockResolvedValue({ _id: 't1' });

    const req = { user: { _id: 'u1' }, params: { id: 't1' } };
    const res = createRes();

    await deleteTask(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Task deleted' });
  });

  test('testReminder emits notification through socket io', async () => {
    const notification = { _id: 'n1' };
    const emit = jest.fn();
    const to = jest.fn().mockReturnValue({ emit });
    const io = { to };

    Notification.create.mockResolvedValue(notification);

    const req = {
      user: { _id: 'u1' },
      app: { get: jest.fn().mockReturnValue(io) }
    };
    const res = createRes();

    await testReminder(req, res);

    expect(Notification.create).toHaveBeenCalled();
    expect(to).toHaveBeenCalledWith('u1');
    expect(emit).toHaveBeenCalledWith('notification', notification);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
