IF SCHEMA_ID(N'question') IS NULL EXEC(N'CREATE SCHEMA [question];');
GO


IF SCHEMA_ID(N'audit') IS NULL EXEC(N'CREATE SCHEMA [audit];');
GO


IF SCHEMA_ID(N'candidate') IS NULL EXEC(N'CREATE SCHEMA [candidate];');
GO


IF SCHEMA_ID(N'interview') IS NULL EXEC(N'CREATE SCHEMA [interview];');
GO


IF SCHEMA_ID(N'exam') IS NULL EXEC(N'CREATE SCHEMA [exam];');
GO


IF SCHEMA_ID(N'master') IS NULL EXEC(N'CREATE SCHEMA [master];');
GO


IF SCHEMA_ID(N'notification') IS NULL EXEC(N'CREATE SCHEMA [notification];');
GO


IF SCHEMA_ID(N'staff') IS NULL EXEC(N'CREATE SCHEMA [staff];');
GO


IF SCHEMA_ID(N'vacancy') IS NULL EXEC(N'CREATE SCHEMA [vacancy];');
GO


CREATE TABLE [question].[AssessmentTemplates] (
    [Id] int NOT NULL IDENTITY,
    [Title] nvarchar(150) NOT NULL,
    [TotalDurationMinutes] int NOT NULL,
    [PassPercentage] decimal(5,2) NOT NULL,
    [ShuffleQuestions] bit NOT NULL,
    [ShuffleOptions] bit NOT NULL,
    [CreatedBy] int NOT NULL,
    [CreatedDate] datetime2 NOT NULL,
    [ModifiedBy] int NULL,
    [ModifiedDate] datetime2 NULL,
    [DeletedBy] int NULL,
    [DeletedDate] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    [RowVersion] varbinary(max) NOT NULL,
    CONSTRAINT [PK_AssessmentTemplates] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [audit].[AuditLogs] (
    [AuditId] int NOT NULL IDENTITY,
    [UserId] int NULL,
    [CandidateId] int NULL,
    [Action] varchar(100) NOT NULL,
    [EntityName] varchar(100) NOT NULL,
    [EntityId] varchar(50) NOT NULL,
    [OldValues] nvarchar(max) NULL,
    [NewValues] nvarchar(max) NULL,
    [IpAddress] varchar(45) NOT NULL,
    [Timestamp] datetime2 NOT NULL,
    CONSTRAINT [PK_AuditLogs] PRIMARY KEY ([AuditId])
);
GO


CREATE TABLE [master].[Locations] (
    [Id] int NOT NULL IDENTITY,
    [City] varchar(100) NOT NULL,
    [State] varchar(100) NOT NULL,
    [Country] varchar(100) NOT NULL DEFAULT 'India',
    [IsActive] bit NOT NULL,
    [CreatedBy] int NOT NULL,
    [CreatedDate] datetime2 NOT NULL,
    [ModifiedBy] int NULL,
    [ModifiedDate] datetime2 NULL,
    [DeletedBy] int NULL,
    [DeletedDate] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    [RowVersion] varbinary(max) NOT NULL,
    CONSTRAINT [PK_Locations] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [notification].[Outbox] (
    [Id] int NOT NULL IDENTITY,
    [Channel] varchar(30) NOT NULL,
    [Recipient] varchar(150) NOT NULL,
    [Subject] nvarchar(200) NOT NULL,
    [Body] nvarchar(max) NOT NULL,
    [Status] varchar(20) NOT NULL DEFAULT 'Pending',
    [RetryCount] int NOT NULL,
    [ScheduledTime] datetime2 NOT NULL,
    [CreatedBy] int NOT NULL,
    [CreatedDate] datetime2 NOT NULL,
    [ModifiedBy] int NULL,
    [ModifiedDate] datetime2 NULL,
    [DeletedBy] int NULL,
    [DeletedDate] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    [RowVersion] varbinary(max) NOT NULL,
    CONSTRAINT [PK_Outbox] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [master].[Permissions] (
    [Id] int NOT NULL IDENTITY,
    [Module] varchar(50) NOT NULL,
    [Action] varchar(50) NOT NULL,
    [Description] varchar(200) NOT NULL,
    [CreatedBy] int NOT NULL,
    [CreatedDate] datetime2 NOT NULL,
    [ModifiedBy] int NULL,
    [ModifiedDate] datetime2 NULL,
    [DeletedBy] int NULL,
    [DeletedDate] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    [RowVersion] varbinary(max) NOT NULL,
    CONSTRAINT [PK_Permissions] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [question].[QuestionBank] (
    [Id] int NOT NULL IDENTITY,
    [QuestionType] varchar(30) NOT NULL,
    [Category] varchar(100) NOT NULL,
    [DifficultyLevel] varchar(20) NOT NULL DEFAULT 'Medium',
    [Title] nvarchar(500) NOT NULL,
    [BodyText] nvarchar(max) NOT NULL,
    [CodeTemplate] nvarchar(max) NULL,
    [CorrectAnswer] nvarchar(max) NULL,
    [Marks] decimal(5,2) NOT NULL,
    [NegativeMarks] decimal(5,2) NOT NULL,
    [Version] int NOT NULL,
    [CreatedBy] int NOT NULL,
    [CreatedDate] datetime2 NOT NULL,
    [ModifiedBy] int NULL,
    [ModifiedDate] datetime2 NULL,
    [DeletedBy] int NULL,
    [DeletedDate] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    [RowVersion] varbinary(max) NOT NULL,
    CONSTRAINT [PK_QuestionBank] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [master].[Roles] (
    [Id] int NOT NULL IDENTITY,
    [RoleName] varchar(50) NOT NULL,
    [Description] varchar(250) NOT NULL,
    [IsSystemRole] bit NOT NULL,
    [CreatedBy] int NOT NULL,
    [CreatedDate] datetime2 NOT NULL,
    [ModifiedBy] int NULL,
    [ModifiedDate] datetime2 NULL,
    [DeletedBy] int NULL,
    [DeletedDate] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    [RowVersion] rowversion NOT NULL,
    CONSTRAINT [PK_Roles] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [staff].[Users] (
    [Id] int NOT NULL IDENTITY,
    [EmployeeCode] varchar(30) NOT NULL,
    [FirstName] nvarchar(50) NOT NULL,
    [LastName] nvarchar(50) NOT NULL,
    [Email] varchar(150) NOT NULL,
    [PasswordHash] varchar(256) NOT NULL,
    [PasswordSalt] varchar(256) NOT NULL,
    [PinHash] varchar(256) NULL,
    [IsActive] bit NOT NULL,
    [Is2FAEnabled] bit NOT NULL,
    [TwoFactorSecret] nvarchar(max) NULL,
    [LockoutEnd] datetime2 NULL,
    [AccessFailedCount] int NOT NULL,
    [CreatedBy] int NOT NULL,
    [CreatedDate] datetime2 NOT NULL,
    [ModifiedBy] int NULL,
    [ModifiedDate] datetime2 NULL,
    [DeletedBy] int NULL,
    [DeletedDate] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    [RowVersion] rowversion NOT NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [question].[TemplateSections] (
    [Id] int NOT NULL IDENTITY,
    [TemplateId] int NOT NULL,
    [SectionName] varchar(100) NOT NULL,
    [DurationMinutes] int NULL,
    [QuestionCount] int NOT NULL,
    [CreatedBy] int NOT NULL,
    [CreatedDate] datetime2 NOT NULL,
    [ModifiedBy] int NULL,
    [ModifiedDate] datetime2 NULL,
    [DeletedBy] int NULL,
    [DeletedDate] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    [RowVersion] varbinary(max) NOT NULL,
    CONSTRAINT [PK_TemplateSections] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_TemplateSections_AssessmentTemplates_TemplateId] FOREIGN KEY ([TemplateId]) REFERENCES [question].[AssessmentTemplates] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [vacancy].[Vacancies] (
    [Id] int NOT NULL IDENTITY,
    [VacancyCode] varchar(30) NOT NULL,
    [Title] nvarchar(150) NOT NULL,
    [Department] varchar(100) NOT NULL,
    [LocationId] int NOT NULL,
    [MinExperienceYears] decimal(4,1) NOT NULL,
    [MaxExperienceYears] decimal(4,1) NOT NULL,
    [OpeningsCount] int NOT NULL,
    [Status] varchar(30) NOT NULL DEFAULT 'Draft',
    [TargetClosureDate] datetime2 NOT NULL,
    [CreatedBy] int NOT NULL,
    [CreatedDate] datetime2 NOT NULL,
    [ModifiedBy] int NULL,
    [ModifiedDate] datetime2 NULL,
    [DeletedBy] int NULL,
    [DeletedDate] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    [RowVersion] rowversion NOT NULL,
    CONSTRAINT [PK_Vacancies] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Vacancies_Locations_LocationId] FOREIGN KEY ([LocationId]) REFERENCES [master].[Locations] ([Id]) ON DELETE NO ACTION
);
GO


CREATE TABLE [question].[QuestionOptions] (
    [Id] int NOT NULL IDENTITY,
    [QuestionId] int NOT NULL,
    [OptionText] nvarchar(1000) NOT NULL,
    [IsCorrect] bit NOT NULL,
    [DisplayOrder] int NOT NULL,
    [CreatedBy] int NOT NULL,
    [CreatedDate] datetime2 NOT NULL,
    [ModifiedBy] int NULL,
    [ModifiedDate] datetime2 NULL,
    [DeletedBy] int NULL,
    [DeletedDate] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    [RowVersion] varbinary(max) NOT NULL,
    CONSTRAINT [PK_QuestionOptions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_QuestionOptions_QuestionBank_QuestionId] FOREIGN KEY ([QuestionId]) REFERENCES [question].[QuestionBank] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [master].[RolePermissions] (
    [Id] int NOT NULL IDENTITY,
    [RoleId] int NOT NULL,
    [PermissionId] int NOT NULL,
    [CreatedBy] int NOT NULL,
    [CreatedDate] datetime2 NOT NULL,
    [ModifiedBy] int NULL,
    [ModifiedDate] datetime2 NULL,
    [DeletedBy] int NULL,
    [DeletedDate] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    [RowVersion] varbinary(max) NOT NULL,
    CONSTRAINT [PK_RolePermissions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_RolePermissions_Permissions_PermissionId] FOREIGN KEY ([PermissionId]) REFERENCES [master].[Permissions] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_RolePermissions_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [master].[Roles] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [staff].[UserRoles] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [RoleId] int NOT NULL,
    [CreatedBy] int NOT NULL,
    [CreatedDate] datetime2 NOT NULL,
    [ModifiedBy] int NULL,
    [ModifiedDate] datetime2 NULL,
    [DeletedBy] int NULL,
    [DeletedDate] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    [RowVersion] varbinary(max) NOT NULL,
    CONSTRAINT [PK_UserRoles] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_UserRoles_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [master].[Roles] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_UserRoles_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [staff].[Users] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [staff].[UserSessions] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [RefreshToken] varchar(256) NOT NULL,
    [RefreshTokenExpiry] datetime2 NOT NULL,
    [IpAddress] varchar(45) NOT NULL,
    [UserAgent] varchar(500) NOT NULL,
    [DeviceFingerprint] varchar(128) NOT NULL,
    [IsRevoked] bit NOT NULL,
    [CreatedBy] int NOT NULL,
    [CreatedDate] datetime2 NOT NULL,
    [ModifiedBy] int NULL,
    [ModifiedDate] datetime2 NULL,
    [DeletedBy] int NULL,
    [DeletedDate] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    [RowVersion] varbinary(max) NOT NULL,
    CONSTRAINT [PK_UserSessions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_UserSessions_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [staff].[Users] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [candidate].[Candidates] (
    [Id] int NOT NULL IDENTITY,
    [CandidateCode] varchar(30) NOT NULL,
    [VacancyId] int NOT NULL,
    [SourceType] varchar(50) NOT NULL,
    [FirstName] nvarchar(50) NOT NULL,
    [LastName] nvarchar(50) NOT NULL,
    [Email] varchar(150) NOT NULL,
    [Mobile] varchar(20) NOT NULL,
    [DOB] datetime2 NOT NULL,
    [Gender] varchar(20) NOT NULL,
    [Address] nvarchar(300) NOT NULL,
    [LocationId] int NOT NULL,
    [CurrentSalary] decimal(12,2) NULL,
    [ExpectedSalary] decimal(12,2) NULL,
    [NoticePeriodDays] int NULL,
    [OverallExperienceMonths] int NOT NULL,
    [PhotoPath] varchar(500) NULL,
    [ResumePath] varchar(500) NULL,
    [Status] varchar(50) NOT NULL DEFAULT 'Registered',
    [CreatedBy] int NOT NULL,
    [CreatedDate] datetime2 NOT NULL,
    [ModifiedBy] int NULL,
    [ModifiedDate] datetime2 NULL,
    [DeletedBy] int NULL,
    [DeletedDate] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    [RowVersion] rowversion NOT NULL,
    CONSTRAINT [PK_Candidates] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Candidates_Locations_LocationId] FOREIGN KEY ([LocationId]) REFERENCES [master].[Locations] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Candidates_Vacancies_VacancyId] FOREIGN KEY ([VacancyId]) REFERENCES [vacancy].[Vacancies] ([Id]) ON DELETE NO ACTION
);
GO


CREATE TABLE [exam].[ExamAssignments] (
    [Id] int NOT NULL IDENTITY,
    [VacancyId] int NOT NULL,
    [TemplateId] int NOT NULL,
    [ValidFrom] datetime2 NOT NULL,
    [ValidTo] datetime2 NOT NULL,
    [CreatedBy] int NOT NULL,
    [CreatedDate] datetime2 NOT NULL,
    [ModifiedBy] int NULL,
    [ModifiedDate] datetime2 NULL,
    [DeletedBy] int NULL,
    [DeletedDate] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    [RowVersion] varbinary(max) NOT NULL,
    CONSTRAINT [PK_ExamAssignments] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ExamAssignments_AssessmentTemplates_TemplateId] FOREIGN KEY ([TemplateId]) REFERENCES [question].[AssessmentTemplates] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_ExamAssignments_Vacancies_VacancyId] FOREIGN KEY ([VacancyId]) REFERENCES [vacancy].[Vacancies] ([Id]) ON DELETE NO ACTION
);
GO


CREATE TABLE [vacancy].[VacancyStages] (
    [Id] int NOT NULL IDENTITY,
    [VacancyId] int NOT NULL,
    [StageOrder] int NOT NULL,
    [StageName] varchar(100) NOT NULL,
    [StageType] varchar(50) NOT NULL,
    [PassMarkPercentage] decimal(5,2) NULL,
    [IsMandatory] bit NOT NULL,
    [CreatedBy] int NOT NULL,
    [CreatedDate] datetime2 NOT NULL,
    [ModifiedBy] int NULL,
    [ModifiedDate] datetime2 NULL,
    [DeletedBy] int NULL,
    [DeletedDate] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    [RowVersion] varbinary(max) NOT NULL,
    CONSTRAINT [PK_VacancyStages] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_VacancyStages_Vacancies_VacancyId] FOREIGN KEY ([VacancyId]) REFERENCES [vacancy].[Vacancies] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [candidate].[Documents] (
    [Id] int NOT NULL IDENTITY,
    [CandidateId] int NOT NULL,
    [DocumentType] varchar(50) NOT NULL,
    [FilePath] varchar(500) NOT NULL,
    [UploadedDate] datetime2 NOT NULL,
    [CreatedBy] int NOT NULL,
    [CreatedDate] datetime2 NOT NULL,
    [ModifiedBy] int NULL,
    [ModifiedDate] datetime2 NULL,
    [DeletedBy] int NULL,
    [DeletedDate] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    [RowVersion] varbinary(max) NOT NULL,
    CONSTRAINT [PK_Documents] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Documents_Candidates_CandidateId] FOREIGN KEY ([CandidateId]) REFERENCES [candidate].[Candidates] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [candidate].[Education] (
    [Id] int NOT NULL IDENTITY,
    [CandidateId] int NOT NULL,
    [Degree] varchar(100) NOT NULL,
    [College] nvarchar(200) NOT NULL,
    [University] nvarchar(200) NOT NULL,
    [PassingYear] int NOT NULL,
    [CGPA] decimal(4,2) NOT NULL,
    [CreatedBy] int NOT NULL,
    [CreatedDate] datetime2 NOT NULL,
    [ModifiedBy] int NULL,
    [ModifiedDate] datetime2 NULL,
    [DeletedBy] int NULL,
    [DeletedDate] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    [RowVersion] varbinary(max) NOT NULL,
    CONSTRAINT [PK_Education] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Education_Candidates_CandidateId] FOREIGN KEY ([CandidateId]) REFERENCES [candidate].[Candidates] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [candidate].[WorkExperience] (
    [Id] int NOT NULL IDENTITY,
    [CandidateId] int NOT NULL,
    [CompanyName] nvarchar(150) NOT NULL,
    [Designation] nvarchar(100) NOT NULL,
    [StartDate] datetime2 NOT NULL,
    [EndDate] datetime2 NULL,
    [IsCurrentJob] bit NOT NULL,
    [CreatedBy] int NOT NULL,
    [CreatedDate] datetime2 NOT NULL,
    [ModifiedBy] int NULL,
    [ModifiedDate] datetime2 NULL,
    [DeletedBy] int NULL,
    [DeletedDate] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    [RowVersion] varbinary(max) NOT NULL,
    CONSTRAINT [PK_WorkExperience] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_WorkExperience_Candidates_CandidateId] FOREIGN KEY ([CandidateId]) REFERENCES [candidate].[Candidates] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [exam].[ExamSessions] (
    [Id] int NOT NULL IDENTITY,
    [SessionToken] varchar(100) NOT NULL,
    [CandidateId] int NOT NULL,
    [ExamAssignmentId] int NOT NULL,
    [StartTime] datetime2 NULL,
    [EndTime] datetime2 NULL,
    [ScheduledExpiryTime] datetime2 NOT NULL,
    [Status] varchar(30) NOT NULL DEFAULT 'Created',
    [TotalObtainedMarks] decimal(6,2) NULL,
    [FinalResult] varchar(20) NOT NULL DEFAULT 'PendingEvaluation',
    [RiskScore] decimal(5,2) NOT NULL DEFAULT 0.0,
    [CreatedBy] int NOT NULL,
    [CreatedDate] datetime2 NOT NULL,
    [ModifiedBy] int NULL,
    [ModifiedDate] datetime2 NULL,
    [DeletedBy] int NULL,
    [DeletedDate] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    [RowVersion] rowversion NOT NULL,
    CONSTRAINT [PK_ExamSessions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ExamSessions_Candidates_CandidateId] FOREIGN KEY ([CandidateId]) REFERENCES [candidate].[Candidates] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ExamSessions_ExamAssignments_ExamAssignmentId] FOREIGN KEY ([ExamAssignmentId]) REFERENCES [exam].[ExamAssignments] ([Id]) ON DELETE NO ACTION
);
GO


CREATE TABLE [interview].[CandidateStageProgress] (
    [Id] int NOT NULL IDENTITY,
    [CandidateId] int NOT NULL,
    [VacancyStageId] int NOT NULL,
    [StageStatus] varchar(30) NOT NULL DEFAULT 'Scheduled',
    [CompletedDate] datetime2 NULL,
    [CreatedBy] int NOT NULL,
    [CreatedDate] datetime2 NOT NULL,
    [ModifiedBy] int NULL,
    [ModifiedDate] datetime2 NULL,
    [DeletedBy] int NULL,
    [DeletedDate] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    [RowVersion] varbinary(max) NOT NULL,
    CONSTRAINT [PK_CandidateStageProgress] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_CandidateStageProgress_Candidates_CandidateId] FOREIGN KEY ([CandidateId]) REFERENCES [candidate].[Candidates] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_CandidateStageProgress_VacancyStages_VacancyStageId] FOREIGN KEY ([VacancyStageId]) REFERENCES [vacancy].[VacancyStages] ([Id]) ON DELETE NO ACTION
);
GO


CREATE TABLE [exam].[ExamAnswers] (
    [Id] int NOT NULL IDENTITY,
    [ExamSessionId] int NOT NULL,
    [QuestionId] int NOT NULL,
    [SubmittedAnswerText] nvarchar(max) NULL,
    [SelectedOptionIds] varchar(200) NULL,
    [ObtainedMarks] decimal(5,2) NULL,
    [IsEvaluated] bit NOT NULL,
    [EvaluatedByUserId] int NULL,
    [EvaluatedDate] datetime2 NULL,
    [CreatedBy] int NOT NULL,
    [CreatedDate] datetime2 NOT NULL,
    [ModifiedBy] int NULL,
    [ModifiedDate] datetime2 NULL,
    [DeletedBy] int NULL,
    [DeletedDate] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    [RowVersion] varbinary(max) NOT NULL,
    CONSTRAINT [PK_ExamAnswers] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ExamAnswers_ExamSessions_ExamSessionId] FOREIGN KEY ([ExamSessionId]) REFERENCES [exam].[ExamSessions] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ExamAnswers_QuestionBank_QuestionId] FOREIGN KEY ([QuestionId]) REFERENCES [question].[QuestionBank] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_ExamAnswers_Users_EvaluatedByUserId] FOREIGN KEY ([EvaluatedByUserId]) REFERENCES [staff].[Users] ([Id]) ON DELETE NO ACTION
);
GO


CREATE TABLE [exam].[ExamViolations] (
    [Id] int NOT NULL IDENTITY,
    [ExamSessionId] int NOT NULL,
    [ViolationType] varchar(50) NOT NULL,
    [SeverityWeight] decimal(4,2) NOT NULL,
    [Timestamp] datetime2 NOT NULL,
    [Details] nvarchar(500) NOT NULL,
    [CreatedBy] int NOT NULL,
    [CreatedDate] datetime2 NOT NULL,
    [ModifiedBy] int NULL,
    [ModifiedDate] datetime2 NULL,
    [DeletedBy] int NULL,
    [DeletedDate] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    [RowVersion] varbinary(max) NOT NULL,
    CONSTRAINT [PK_ExamViolations] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ExamViolations_ExamSessions_ExamSessionId] FOREIGN KEY ([ExamSessionId]) REFERENCES [exam].[ExamSessions] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [interview].[InterviewSchedules] (
    [Id] int NOT NULL IDENTITY,
    [ProgressId] int NOT NULL,
    [InterviewerUserId] int NOT NULL,
    [ScheduledStartTime] datetime2 NOT NULL,
    [ScheduledEndTime] datetime2 NOT NULL,
    [MeetingLink] varchar(500) NULL,
    [LocationDetails] nvarchar(200) NULL,
    [CreatedBy] int NOT NULL,
    [CreatedDate] datetime2 NOT NULL,
    [ModifiedBy] int NULL,
    [ModifiedDate] datetime2 NULL,
    [DeletedBy] int NULL,
    [DeletedDate] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    [RowVersion] varbinary(max) NOT NULL,
    CONSTRAINT [PK_InterviewSchedules] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_InterviewSchedules_CandidateStageProgress_ProgressId] FOREIGN KEY ([ProgressId]) REFERENCES [interview].[CandidateStageProgress] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_InterviewSchedules_Users_InterviewerUserId] FOREIGN KEY ([InterviewerUserId]) REFERENCES [staff].[Users] ([Id]) ON DELETE NO ACTION
);
GO


CREATE TABLE [interview].[InterviewFeedbacks] (
    [Id] int NOT NULL IDENTITY,
    [ScheduleId] int NOT NULL,
    [TechnicalRating] int NOT NULL,
    [CommunicationRating] int NOT NULL,
    [ProblemSolvingRating] int NOT NULL,
    [CulturalFitRating] int NOT NULL,
    [Strengths] nvarchar(max) NOT NULL,
    [Weaknesses] nvarchar(max) NOT NULL,
    [Recommendation] varchar(30) NOT NULL DEFAULT 'Hire',
    [Comments] nvarchar(max) NOT NULL,
    [CreatedBy] int NOT NULL,
    [CreatedDate] datetime2 NOT NULL,
    [ModifiedBy] int NULL,
    [ModifiedDate] datetime2 NULL,
    [DeletedBy] int NULL,
    [DeletedDate] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    [RowVersion] varbinary(max) NOT NULL,
    CONSTRAINT [PK_InterviewFeedbacks] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_InterviewFeedbacks_InterviewSchedules_ScheduleId] FOREIGN KEY ([ScheduleId]) REFERENCES [interview].[InterviewSchedules] ([Id]) ON DELETE CASCADE
);
GO


CREATE UNIQUE INDEX [IX_Candidates_CandidateCode] ON [candidate].[Candidates] ([CandidateCode]);
GO


CREATE INDEX [IX_Candidates_Email] ON [candidate].[Candidates] ([Email]);
GO


CREATE INDEX [IX_Candidates_LocationId] ON [candidate].[Candidates] ([LocationId]);
GO


CREATE INDEX [IX_Candidates_VacancyId] ON [candidate].[Candidates] ([VacancyId]);
GO


CREATE INDEX [IX_CandidateStageProgress_CandidateId] ON [interview].[CandidateStageProgress] ([CandidateId]);
GO


CREATE INDEX [IX_CandidateStageProgress_VacancyStageId] ON [interview].[CandidateStageProgress] ([VacancyStageId]);
GO


CREATE INDEX [IX_Documents_CandidateId] ON [candidate].[Documents] ([CandidateId]);
GO


CREATE INDEX [IX_Education_CandidateId] ON [candidate].[Education] ([CandidateId]);
GO


CREATE INDEX [IX_ExamAnswers_EvaluatedByUserId] ON [exam].[ExamAnswers] ([EvaluatedByUserId]);
GO


CREATE INDEX [IX_ExamAnswers_ExamSessionId] ON [exam].[ExamAnswers] ([ExamSessionId]);
GO


CREATE INDEX [IX_ExamAnswers_QuestionId] ON [exam].[ExamAnswers] ([QuestionId]);
GO


CREATE INDEX [IX_ExamAssignments_TemplateId] ON [exam].[ExamAssignments] ([TemplateId]);
GO


CREATE INDEX [IX_ExamAssignments_VacancyId] ON [exam].[ExamAssignments] ([VacancyId]);
GO


CREATE INDEX [IX_ExamSessions_CandidateId] ON [exam].[ExamSessions] ([CandidateId]);
GO


CREATE INDEX [IX_ExamSessions_ExamAssignmentId] ON [exam].[ExamSessions] ([ExamAssignmentId]);
GO


CREATE UNIQUE INDEX [IX_ExamSessions_SessionToken] ON [exam].[ExamSessions] ([SessionToken]);
GO


CREATE INDEX [IX_ExamViolations_ExamSessionId] ON [exam].[ExamViolations] ([ExamSessionId]);
GO


CREATE INDEX [IX_InterviewFeedbacks_ScheduleId] ON [interview].[InterviewFeedbacks] ([ScheduleId]);
GO


CREATE INDEX [IX_InterviewSchedules_InterviewerUserId] ON [interview].[InterviewSchedules] ([InterviewerUserId]);
GO


CREATE INDEX [IX_InterviewSchedules_ProgressId] ON [interview].[InterviewSchedules] ([ProgressId]);
GO


CREATE INDEX [IX_QuestionOptions_QuestionId] ON [question].[QuestionOptions] ([QuestionId]);
GO


CREATE INDEX [IX_RolePermissions_PermissionId] ON [master].[RolePermissions] ([PermissionId]);
GO


CREATE INDEX [IX_RolePermissions_RoleId] ON [master].[RolePermissions] ([RoleId]);
GO


CREATE INDEX [IX_TemplateSections_TemplateId] ON [question].[TemplateSections] ([TemplateId]);
GO


CREATE INDEX [IX_UserRoles_RoleId] ON [staff].[UserRoles] ([RoleId]);
GO


CREATE INDEX [IX_UserRoles_UserId] ON [staff].[UserRoles] ([UserId]);
GO


CREATE UNIQUE INDEX [IX_Users_Email] ON [staff].[Users] ([Email]);
GO


CREATE UNIQUE INDEX [IX_Users_EmployeeCode] ON [staff].[Users] ([EmployeeCode]);
GO


CREATE INDEX [IX_UserSessions_UserId] ON [staff].[UserSessions] ([UserId]);
GO


CREATE INDEX [IX_Vacancies_LocationId] ON [vacancy].[Vacancies] ([LocationId]);
GO


CREATE INDEX [IX_VacancyStages_VacancyId] ON [vacancy].[VacancyStages] ([VacancyId]);
GO


CREATE INDEX [IX_WorkExperience_CandidateId] ON [candidate].[WorkExperience] ([CandidateId]);
GO


