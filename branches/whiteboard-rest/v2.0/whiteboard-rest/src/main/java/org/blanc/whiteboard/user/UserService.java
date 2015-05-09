package org.blanc.whiteboard.user;

import org.blanc.whiteboard.user.api.ApiUser;
import org.blanc.whiteboard.user.api.CreateUserRequest;
import org.blanc.whiteboard.user.api.UpdateUserRequest;

public interface UserService {

    public ApiUser createUser(final CreateUserRequest createUserRequest);

    public ApiUser authenticate(String username, String password);

    public ApiUser getUser(String userId);

    /**
     * Save User
     *
     * @param userId
     * @param request
     */
    public ApiUser saveUser(String userId, UpdateUserRequest request);

}
