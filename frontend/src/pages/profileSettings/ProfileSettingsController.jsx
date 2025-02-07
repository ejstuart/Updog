import { useContext, useState } from 'react'
import { useNavigate } from 'react-router'
import ProfileSettingsView from './ProfileSettingsView'
import useApi from '../../hooks/useApi'
import { request, uploadImage } from '../../functions'
import SERVER_URL from '../../config'
import LoadingView from '../loading/LoadingView'
import { AuthContext } from '../../contexts/AuthProvider'

/**
 * This page is where users can edit their profile
 */
const ProfileSettingsController = () => {
  const {
    user: { username },
    logout,
  } = useContext(AuthContext)
  const { data, loading, err } = useApi(`users/${username}`)
  const [avatarModalOpen, setAvatarModalOpen] = useState(false)
  const [selectedPicture, setSelectedPicture] = useState(null)
  const [selectedBanner, setSelectedBanner] = useState(null)
  const [bioText, setBioText] = useState()

  const navigate = useNavigate()

  // const [bannerModalOpen, setBannerModalOpen] = useState(false)

  if (loading) {
    return <LoadingView />
  }

  if (err) {
    return <div>Error: {err.message}</div>
  }

  /**
   * Update profile picture
   */
  const updateProfile = async () => {
    const imageUpload = new FormData()
    imageUpload.append('attachments', selectedPicture)

    await uploadImage(imageUpload)

    const fileName = selectedPicture.name
    const { nickname, bio, profileBanner } = data

    if (selectedPicture != null) {
      await request('users', 'PUT', {
        username,
        nickname,
        bio,
        profilePic: `${SERVER_URL}/images/${fileName}`,
        profileBanner,
      })
    }
  }

  /**
   * Update Banner, if its a default banner, no need to upload the image.
   */
  const updateBannerUpload = async () => {
    let fileName
    const { nickname, bio, profilePic } = data

    try {
      // eslint-disable-next-line no-unused-vars
      const url = new URL(selectedBanner)

      if (selectedBanner != null) {
        await request('users', 'PUT', {
          username,
          nickname,
          bio,
          profilePic,
          profileBanner: selectedBanner,
        })
      }
    } catch (_) {
      const imageUpload = new FormData()
      imageUpload.append('attachments', selectedBanner)

      await uploadImage(imageUpload)
      fileName = selectedBanner.name
      if (selectedBanner != null) {
        await request('users', 'PUT', {
          username,
          nickname,
          bio,
          profilePic,
          profileBanner: `${SERVER_URL}/images/${fileName}`,
        })
      }
    }
  }

  /**
   * update bio
   * @param {string} bio
   */
  const updateBio = async (bio) => {
    const { nickname, profileBanner, profilePic } = data

    await request('users', 'PUT', {
      username,
      nickname,
      bio,
      profilePic,
      profileBanner,
    })
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleAvatarOpen = () => {
    setAvatarModalOpen(true)
  }

  const handleAvatarClose = () => {
    setAvatarModalOpen(false)
  }

  const handleProfilePic = (e) => {
    const image = e.target.files[0]
    setSelectedPicture(image)
  }

  return (
    <ProfileSettingsView
      user={data}
      updateProfile={updateProfile}
      avatarOpen={avatarModalOpen}
      handleAvatarOpen={handleAvatarOpen}
      handleAvatarClose={handleAvatarClose}
      profilePicture={selectedPicture}
      handleProfilePic={handleProfilePic}
      handleBioUpdate={updateBio}
      bioText={bioText}
      setBioText={setBioText}
      updateBannerUpload={updateBannerUpload}
      selectedBanner={selectedBanner}
      setSelectedBanner={setSelectedBanner}
      logout={handleLogout}
    />
  )
}

export default ProfileSettingsController
