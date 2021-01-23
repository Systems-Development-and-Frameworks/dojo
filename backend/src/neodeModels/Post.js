module.exports = {
  id: {
    type: 'uuid',
    primary: true
  },
  title: {
    type: 'string',
    required: true
  },
  authored: {
    type: 'relationship',
    target: 'User',
    relationship: 'AUTHORED',
    direction: 'in',
    cascade: 'detach',
    eager: true
  },
  upvoted: {
    type: 'relationship',
    target: 'User',
    relationship: 'UPVOTED',
    direction: 'in',
    cascade: 'detach'
  },
  downvoted: {
    type: 'relationship',
    target: 'User',
    relationship: 'DOWNVOTED',
    direction: 'in',
    cascade: 'detach'
  }
}
