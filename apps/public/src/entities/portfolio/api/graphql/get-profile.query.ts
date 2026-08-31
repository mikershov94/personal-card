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
        }
    }
`;
