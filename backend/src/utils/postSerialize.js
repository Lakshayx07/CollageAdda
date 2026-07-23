export const toIdString = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value._id) return value._id.toString();
  return value.toString();
};

export const slimAuthor = (author) => {
  if (!author) return author;
  const id = toIdString(author._id || author.id);
  return {
    _id: author._id || author.id,
    name: author.name,
    university: author.university,
    isVerified: Boolean(author.isVerified),
    profilePic: id ? `/api/users/${id}/avatar` : undefined,
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
          name: comment.user.name || 'Student'
        }
      : null
  }));
};

/** Rewrite inline base64 media to a dedicated endpoint so feeds stay small. */
export const resolveMediaUrl = (post) => {
  const mediaUrl = post?.mediaUrl || '';
  if (!mediaUrl) return '';
  if (mediaUrl.startsWith('data:')) {
    return `/api/posts/${toIdString(post._id)}/media`;
  }
  return mediaUrl;
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
    poll: slimPoll(post.poll, userId)
  };
};
