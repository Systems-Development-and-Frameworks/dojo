module.exports = {
  id: {
    type: 'uuid',
    primary: true
  },
  name: {
    type: 'string',
    required: true
  },
  email: {
    type: 'string',
    unique: true,
    required: true
  },
  passwordHash: {
    type: 'string',
    required: true
  },
  authored: {
    type: 'relationship',
    target: 'Post',
    relationship: 'AUTHORED',
    direction: 'out',
    cascade: 'delete'
  },
  upvoted: {
    type: 'relationship',
    target: 'Post',
    relationship: 'UPVOTED',
    direction: 'out',
    cascade: 'detach'
  },
  downvoted: {
    type: 'relationship',
    target: 'Post',
    relationship: 'DOWNVOTED',
    direction: 'out',
    cascade: 'detach'
  }
}
