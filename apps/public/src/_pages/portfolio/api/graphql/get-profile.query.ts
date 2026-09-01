export const GET_PROFILE_QUERY = `
    query GetProfile {
        getProfile {
            displayName
            headline
            summary
            location
            avatarUrl
            skills {
                sortOrder
                skill {
                    name
                }
            }
            experiences {
                id
                company
                position
                location
                description
                startedAt
                endedAt
                sortOrder
                projects {
                    id
                    experienceId
                    title
                    description
                    url
                    repositoryUrl
                    sortOrder
                    skills {
                        sortOrder
                        skill {
                            name
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
                skills {
                    sortOrder
                    skill {
                        name
                    }
                }
            }
        }
    }
`;
