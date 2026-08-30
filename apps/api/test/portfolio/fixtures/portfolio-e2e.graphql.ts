export const profileSelection = `
    id
    displayName
    headline
    summary
    location
    avatarUrl
    createdAt
    updatedAt
    experiences {
        id
        company
        position
        location
        description
        startedAt
        endedAt
        sortOrder
        createdAt
        updatedAt
        projects {
            id
            experienceId
            title
            description
            url
            repositoryUrl
            sortOrder
            createdAt
            updatedAt
            skills {
                sortOrder
                skill {
                    id
                    name
                    createdAt
                    updatedAt
                }
            }
        }
    }
    projects {
        id
        experienceId
        title
        description
        url
        repositoryUrl
        sortOrder
        createdAt
        updatedAt
        skills {
            sortOrder
            skill {
                id
                name
                createdAt
                updatedAt
            }
        }
    }
    skills {
        sortOrder
        skill {
            id
            name
            createdAt
            updatedAt
        }
    }
`;

export const experienceSelection = `
    id
    company
    position
    location
    description
    startedAt
    endedAt
    sortOrder
    createdAt
    updatedAt
    projects {
        id
        experienceId
        title
        description
        url
        repositoryUrl
        sortOrder
        createdAt
        updatedAt
        skills {
            sortOrder
            skill {
                id
                name
                createdAt
                updatedAt
            }
        }
    }
`;

export const projectSelection = `
    id
    experienceId
    title
    description
    url
    repositoryUrl
    sortOrder
    createdAt
    updatedAt
    skills {
        sortOrder
        skill {
            id
            name
            createdAt
            updatedAt
        }
    }
`;

export const createProfileMutation = `
    mutation CreateProfile($input: CreateProfileInput!) {
        createProfile(input: $input) {
            ${profileSelection}
        }
    }
`;

export const updateProfileMutation = `
    mutation UpdateProfile($input: UpdateProfileInput!) {
        updateProfile(input: $input) {
            ${profileSelection}
        }
    }
`;

export const getProfileQuery = `
    query GetProfile {
        getProfile {
            ${profileSelection}
        }
    }
`;

export const createExperienceMutation = `
    mutation CreateExperience($input: CreateExperienceInput!) {
        createExperience(input: $input) {
            ${experienceSelection}
        }
    }
`;

export const updateExperienceMutation = `
    mutation UpdateExperience($id: ID!, $input: UpdateExperienceInput!) {
        updateExperience(id: $id, input: $input) {
            ${experienceSelection}
        }
    }
`;

export const deleteExperienceMutation = `
    mutation DeleteExperience($id: ID!) {
        deleteExperience(id: $id)
    }
`;

export const createProjectMutation = `
    mutation CreateProject($input: CreateProjectInput!) {
        createProject(input: $input) {
            ${projectSelection}
        }
    }
`;

export const updateProjectMutation = `
    mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
        updateProject(id: $id, input: $input) {
            ${projectSelection}
        }
    }
`;

export const deleteProjectMutation = `
    mutation DeleteProject($id: ID!) {
        deleteProject(id: $id)
    }
`;

export const skillSelection = `
    id
    name
    createdAt
    updatedAt
`;

export const createSkillMutation = `
    mutation CreateSkill($input: CreateSkillInput!) {
        createSkill(input: $input) {
            ${skillSelection}
        }
    }
`;

export const updateSkillMutation = `
    mutation UpdateSkill($id: ID!, $input: UpdateSkillInput!) {
        updateSkill(id: $id, input: $input) {
            ${skillSelection}
        }
    }
`;

export const deleteSkillMutation = `
    mutation DeleteSkill($id: ID!) {
        deleteSkill(id: $id)
    }
`;

export const attachSkillToProfileMutation = `
    mutation AttachSkillToProfile($skillId: ID!, $sortOrder: Int) {
        attachSkillToProfile(skillId: $skillId, sortOrder: $sortOrder)
    }
`;

export const detachSkillFromProfileMutation = `
    mutation DetachSkillFromProfile($skillId: ID!) {
        detachSkillFromProfile(skillId: $skillId)
    }
`;

export const attachSkillToProjectMutation = `
    mutation AttachSkillToProject($projectId: ID!, $skillId: ID!, $sortOrder: Int) {
        attachSkillToProject(projectId: $projectId, skillId: $skillId, sortOrder: $sortOrder)
    }
`;

export const detachSkillFromProjectMutation = `
    mutation DetachSkillFromProject($projectId: ID!, $skillId: ID!) {
        detachSkillFromProject(projectId: $projectId, skillId: $skillId)
    }
`;
