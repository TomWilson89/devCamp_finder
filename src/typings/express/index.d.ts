declare namespace Express {
  interface Request {
    asPublic: boolean;
    user: import("../../services/users/users.interface").IUserDocument;
    targetBootcamp: import("../../services/bootcamp/bootcamp.interface").IBootcampDocument;
    targetCourse: import("../../services/courses/courses.interface").ICourseDocument;
    targetReview: import("../../services/reviews/review.interface").IReviewDocument;
    token: {
      accessToken: string;
      expiresAt: Date;
    };
  }
}
