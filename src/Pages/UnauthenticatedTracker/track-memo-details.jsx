import React from 'react'
import { useParams } from 'react-router-dom'
import TrackMemoDetails from '../../Components/UnauthenticatedTracking/TrackMemoDetails'

function UnauthenticatedTrackMemoDetails() {
  const { id } = useParams()
  
  return <TrackMemoDetails trackingId={id} onBack={() => window.history.back()} />
}

export default UnauthenticatedTrackMemoDetails