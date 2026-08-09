export const toIdString = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value._id) return value._id.toString();
  return value.toString();
};

export const slimAuthor = (author) => {
  if (!author) return author;
  return {
    _id: author._id || author.id,
    name: author.name,
    university: author.university,
    isVerified: Boolean(author.isVerified),
    profilePic: `/api/users/${author._id || author.id}/avatar`,
    xp: author.xp,
    points: author.points,
    currentTick: author.currentTick,
  };
};

export const slimPoll = (poll, userId) => {
  if (!poll) return undefined;
  const uid = toIdString(userId);
  return {
    question: poll.question,
    allowMultiple: Boolean(poll.allowMultiple),
    options: (poll.options || []).map((option) => {
      const votes = option.votes || [];
      return {
        text: option.text,
        votesCount: votes.length,
        votedByMe: votes.some((id) => toIdString(id) === uid)
      };
    })
  };
};

export const slimComments = (comments = []) => {
  return comments.slice(-5).map((comment) => ({
    _id: comment._id,
    text: comment.text,
    createdAt: comment.createdAt,
    user: comment.user
      ? {
          _id: comment.user._id || comment.user,
          name: comment.user.name || 'Student',
          profilePic: `/api/users/${comment.user._id || comment.user}/avatar`
        }
      : null
  }));
};

export const resolveMediaUrl = (post) => {
  if (post && post.mediaType && post.mediaType !== 'none') {
    return `/api/posts/${toIdString(post._id)}/media`;
  }
  return '';
};

export const slimPost = (post, userId) => {
  if (!post) return post;
  const uid = toIdString(userId);
  const likes = post.likes || [];
  const comments = post.comments || [];

  return {
    _id: post._id,
    content: post.content,
    mediaUrl: resolveMediaUrl(post),
    mediaType: post.mediaType,
    hashtags: post.hashtags || [],
    university: post.university,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: slimAuthor(post.author),
    likesCount: likes.length,
    likedByMe: likes.some((id) => toIdString(id) === uid),
    commentsCount: comments.length,
    comments: slimComments(comments),
    poll: slimPoll(post.poll, userId),
    isMemoryOnly: post.isMemoryOnly || false
  };
};
