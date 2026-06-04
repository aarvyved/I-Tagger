import express from 'express';
import cors from 'cors';
import { ulid } from 'ulid';
import sanitizeHtml from 'sanitize-html';
import { users, images, threads } from './store';
import { requireAuth } from './middleware/auth';

const app = express();
app.use(cors());
app.use(express.json());

// --- Public Endpoints ---

// Create user
app.post('/users', (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Valid name is required' });
  }
  
  if (users.find(u => u.name === name)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const newUser = { name };
  users.push(newUser);
  res.status(201).json(newUser);
});

// Authenticate user
app.post('/login', (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Valid name is required' });
  }

  const user = users.find(u => u.name === name);
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(401).json({ error: 'User not found' });
  }
});

// --- Protected Endpoints ---
app.use(requireAuth);

// Retrieve all users
app.get('/users', (req, res) => {
  res.json(users);
});

// Create new image
app.post('/images', (req, res) => {
  const id = ulid();
  const newImage = {
    id,
    url: `https://picsum.photos/seed/${id}/800/600` // Use seed with id to always get a valid image
  };
  
  images.push(newImage);
  res.status(201).json(newImage);
});

// Retrieve list of all images
app.get('/images', (req, res) => {
  res.json(images);
});

// Delete an image
app.delete('/images/:id', (req, res) => {
  const { id } = req.params;
  const index = images.findIndex(img => img.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Image not found' });
  }
  
  images.splice(index, 1);
  // Optional: Also delete associated threads
  const threadsToDelete = threads.filter(t => t.imageId === id).map(t => t.id);
  threadsToDelete.forEach(threadId => {
    const tIndex = threads.findIndex(t => t.id === threadId);
    if (tIndex !== -1) threads.splice(tIndex, 1);
  });
  
  res.status(204).send();
});

// Create a new comment pin
app.post('/images/:id/threads', (req, res) => {
  const imageId = req.params.id;
  const { x, y, comment } = req.body;
  
  if (typeof x !== 'number' || typeof y !== 'number' || !comment || typeof comment !== 'string') {
    return res.status(400).json({ error: 'Invalid input data' });
  }
  
  const imageExists = images.find(img => img.id === imageId);
  if (!imageExists) {
    return res.status(404).json({ error: 'Image not found' });
  }

  // Sanitize the comment
  const cleanComment = sanitizeHtml(comment);

  const newThread = {
    id: ulid(),
    imageId,
    creator: (req as any).user.name,
    x,
    y,
    comment: cleanComment,
    replies: []
  };

  threads.push(newThread);
  res.status(201).json(newThread);
});

// Retrieve all threads for a specific image
app.get('/images/:id/threads', (req, res) => {
  const imageId = req.params.id;
  const imageThreads = threads.filter(t => t.imageId === imageId);
  res.json(imageThreads);
});

// Delete a thread (must be creator)
app.delete('/threads/:id', (req, res) => {
  const { id } = req.params;
  const username = (req as any).user.name;
  
  const index = threads.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Thread not found' });
  }
  
  if (threads[index].creator !== username) {
    return res.status(403).json({ error: 'Forbidden: You are not the creator of this thread' });
  }
  
  threads.splice(index, 1);
  res.status(204).send();
});

// Update a thread's coordinates (Bonus feature)
app.patch('/threads/:id', (req, res) => {
  const { id } = req.params;
  const { x, y } = req.body;
  const username = (req as any).user.name;
  
  const thread = threads.find(t => t.id === id);
  if (!thread) {
    return res.status(404).json({ error: 'Thread not found' });
  }
  
  if (thread.creator !== username) {
    return res.status(403).json({ error: 'Forbidden: You are not the creator of this thread' });
  }
  
  if (typeof x === 'number') thread.x = x;
  if (typeof y === 'number') thread.y = y;
  
  res.json(thread);
});

// Add a reply to a thread
app.post('/threads/:id/replies', (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  const username = (req as any).user.name;

  if (!comment || typeof comment !== 'string') {
    return res.status(400).json({ error: 'Invalid input data' });
  }

  const thread = threads.find(t => t.id === id);
  if (!thread) {
    return res.status(404).json({ error: 'Thread not found' });
  }

  const cleanComment = sanitizeHtml(comment);
  
  const newReply = {
    id: ulid(),
    creator: username,
    comment: cleanComment,
    createdAt: Date.now()
  };

  thread.replies.push(newReply);
  res.status(201).json(newReply);
});

// Delete a reply from a thread
app.delete('/threads/:id/replies/:replyId', (req, res) => {
  const { id, replyId } = req.params;
  const username = (req as any).user.name;

  const thread = threads.find(t => t.id === id);
  if (!thread) {
    return res.status(404).json({ error: 'Thread not found' });
  }

  const replyIndex = thread.replies.findIndex(r => r.id === replyId);
  if (replyIndex === -1) {
    return res.status(404).json({ error: 'Reply not found' });
  }

  if (thread.replies[replyIndex].creator !== username) {
    return res.status(403).json({ error: 'Forbidden: You can only delete your own replies' });
  }

  thread.replies.splice(replyIndex, 1);
  res.status(204).send();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
